/**
 * SamacharHUB — Database Validation Utilities
 * Helper functions to validate data integrity across all MongoDB collections.
 * Used internally by the admin panel and during testing.
 */

import { Article } from "../models/Article.js";
import { Category } from "../models/Category.js";
import { Edition } from "../models/Edition.js";
import { AdminUser } from "../models/AdminUser.js";
import { BreakingNews } from "../models/BreakingNews.js";
import { Ad } from "../models/Ad.js";
import { Subscriber } from "../models/Subscriber.js";

export interface DbHealthReport {
  collections: {
    articles: number;
    categories: number;
    editions: number;
    admins: number;
    breakingNews: number;
    ads: number;
    subscribers: number;
  };
  warnings: string[];
  isHealthy: boolean;
}

/**
 * Performs a full health check of all DB collections.
 * Returns counts and any warnings (e.g. no admin user exists, no categories, etc.)
 */
export async function checkDatabaseHealth(): Promise<DbHealthReport> {
  const warnings: string[] = [];

  const [
    articles,
    categories,
    editions,
    admins,
    breakingNews,
    ads,
    subscribers,
  ] = await Promise.all([
    Article.countDocuments(),
    Category.countDocuments(),
    Edition.countDocuments(),
    AdminUser.countDocuments(),
    BreakingNews.countDocuments(),
    Ad.countDocuments(),
    Subscriber.countDocuments(),
  ]);

  if (admins === 0) {
    warnings.push("⚠️  No admin users found. Run `pnpm seed` to create the default admin.");
  }
  if (categories === 0) {
    warnings.push("⚠️  No categories found. Articles cannot be created without categories.");
  }
  if (articles === 0) {
    warnings.push("ℹ️  No articles yet. Create some from the Admin panel → Articles.");
  }

  return {
    collections: { articles, categories, editions, admins, breakingNews, ads, subscribers },
    warnings,
    isHealthy: admins > 0 && categories > 0,
  };
}

/**
 * Finds articles that reference a non-existent category (orphaned articles).
 * Returns the IDs of affected articles.
 */
export async function findOrphanedArticles(): Promise<string[]> {
  const categoryIds = (await Category.find().select("_id")).map(c => c._id.toString());
  const articles = await Article.find().select("_id category");
  return articles
    .filter(a => !categoryIds.includes(a.category?.toString()))
    .map(a => a._id.toString());
}

/**
 * Finds editions that have no pages uploaded (cover only).
 */
export async function findEmptyEditions(): Promise<string[]> {
  const editions = await Edition.find({ pages: { $size: 0 } }).select("_id date cities");
  return editions.map(e => e._id.toString());
}

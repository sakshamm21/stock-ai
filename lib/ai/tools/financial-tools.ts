import { z } from 'zod';
import {
  getSnapshot,
  getHistoricalPrices,
  getNews,
  getIncomeStatements,
  getBalanceSheets,
  getCashFlowStatements,
  getFinancialMetrics,
  searchStocks,
} from '@/lib/api/fmp';

export const financialTools = [
  'getStockPrices',
  'getIncomeStatements',
  'getBalanceSheets',
  'getCashFlowStatements',
  'getFinancialMetrics',
  'searchStocksByFilters',
  'getNews',
] as const;

export type AllowedTools = typeof financialTools[number];

export interface FinancialToolsConfig {
  financialDataApiKey: string;
  dataStream: any;
}

export class FinancialToolsManager {
  private toolCallCache = new Set<string>();
  private config: FinancialToolsConfig;

  constructor(config: FinancialToolsConfig) {
    this.config = config;
  }

  private shouldExecuteToolCall(toolName: string, params: any): boolean {
    const key = JSON.stringify({ toolName, params });
    if (this.toolCallCache.has(key)) {
      return false;
    }
    this.toolCallCache.add(key);
    return true;
  }

  public getTools() {
    return {
      getNews: {
        description: 'Use this tool to get the latest general market news and articles.  This tool returns general financial market news (not ticker-specific).  When using this tool, include dates in your output.',
        parameters: z.object({
          ticker: z.string().optional().describe('A ticker to associate with the news (for display only)'),
          limit: z.number().optional().default(5).describe('The number of news articles to return'),
        }),
        execute: async ({ ticker, limit }: { ticker?: string; limit?: number }) => {
          return getNews(ticker ?? '', limit ?? 5, this.config.financialDataApiKey);
        },
      },
      getStockPrices: {
        description: 'Use this tool to get stock prices and market cap for a company.  This tool will return a snapshot of the current price, market cap, and the historical prices over a given time period.',
        parameters: z.object({
          ticker: z.string().describe('The ticker of the company to get historical prices for'),
          start_date: z.string().optional().describe('The start date for historical prices (YYYY-MM-DD)').default(() => {
            const date = new Date();
            date.setMonth(date.getMonth() - 1);
            return date.toISOString().split('T')[0];
          }),
          end_date: z.string().optional().describe('The end date for historical prices (YYYY-MM-DD)').default(() => {
            return new Date().toISOString().split('T')[0];
          }),
          interval: z.enum(['second', 'minute', 'day', 'week', 'month', 'year']).default('day').describe('The interval between price points'),
          interval_multiplier: z.number().default(1).describe('The multiplier for the interval'),
        }),
        execute: async ({ ticker, start_date, end_date }: {
          ticker: string;
          start_date?: string;
          end_date?: string;
          interval?: string;
          interval_multiplier?: number;
        }) => {
          if (!this.shouldExecuteToolCall('getStockPrices', { ticker, start_date, end_date })) {
            return null;
          }

          const [snapshotData, historicalData] = await Promise.all([
            getSnapshot(ticker, this.config.financialDataApiKey),
            getHistoricalPrices(ticker, start_date || '', end_date || '', this.config.financialDataApiKey),
          ]);

          return {
            ticker,
            snapshot: { snapshot: snapshotData },
            historical: historicalData,
          };
        },
      },
      getIncomeStatements: {
        description: 'Get the income statements of a company',
        parameters: z.object({
          ticker: z.string().describe('The ticker of the company to get income statements for'),
          period: z.enum(['quarterly', 'annual', 'ttm']).default('ttm').describe('The period of the income statements to return'),
          limit: z.number().int().min(1).optional().default(5).describe('The number of income statements to return'),
        }),
        execute: async ({ ticker, period, limit }: {
          ticker: string;
          period?: 'quarterly' | 'annual' | 'ttm';
          limit?: number;
        }) => {
          if (!this.shouldExecuteToolCall('getIncomeStatements', { ticker, period, limit })) {
            return null;
          }
          try {
            return await getIncomeStatements(ticker, period ?? 'ttm', limit ?? 5, this.config.financialDataApiKey);
          } catch (error) {
            console.error('getIncomeStatements error:', error);
            throw error;
          }
        },
      },
      getBalanceSheets: {
        description: 'Get the balance sheets of a company',
        parameters: z.object({
          ticker: z.string().describe('The ticker of the company to get balance sheets for'),
          period: z.enum(['quarterly', 'annual', 'ttm']).default('ttm').describe('The period of the balance sheets to return'),
          limit: z.number().int().min(1).optional().default(5).describe('The number of balance sheets to return'),
        }),
        execute: async ({ ticker, period, limit }: {
          ticker: string;
          period?: 'quarterly' | 'annual' | 'ttm';
          limit?: number;
        }) => {
          if (!this.shouldExecuteToolCall('getBalanceSheets', { ticker, period, limit })) {
            return null;
          }
          try {
            return await getBalanceSheets(ticker, period ?? 'ttm', limit ?? 5, this.config.financialDataApiKey);
          } catch (error) {
            console.error('getBalanceSheets error:', error);
            throw error;
          }
        },
      },
      getCashFlowStatements: {
        description: 'Get the cash flow statements of a company',
        parameters: z.object({
          ticker: z.string().describe('The ticker of the company to get cash flow statements for'),
          period: z.enum(['quarterly', 'annual', 'ttm']).default('ttm').describe('The period of the cash flow statements to return'),
          limit: z.number().int().min(1).optional().default(5).describe('The number of cash flow statements to return'),
        }),
        execute: async ({ ticker, period, limit }: {
          ticker: string;
          period?: 'quarterly' | 'annual' | 'ttm';
          limit?: number;
        }) => {
          if (!this.shouldExecuteToolCall('getCashFlowStatements', { ticker, period, limit })) {
            return null;
          }
          return getCashFlowStatements(ticker, period ?? 'ttm', limit ?? 5, this.config.financialDataApiKey);
        },
      },
      getFinancialMetrics: {
        description: 'Get the financial metrics of a company.  These financial metrics are derived metrics like P/E ratio, operating income, etc. that cannot be found in the income statement, balance sheet, or cash flow statement.',
        parameters: z.object({
          ticker: z.string().describe('The ticker of the company to get financial metrics for'),
          period: z.enum(['quarterly', 'annual', 'ttm']).default('ttm').describe('The period of the financial metrics to return'),
          limit: z.number().int().min(1).optional().default(5).describe('The number of financial metrics to return'),
        }),
        execute: async ({ ticker, period, limit }: {
          ticker: string;
          period?: 'quarterly' | 'annual' | 'ttm';
          limit?: number;
        }) => {
          if (!this.shouldExecuteToolCall('getFinancialMetrics', { ticker, period, limit })) {
            return null;
          }
          try {
            return await getFinancialMetrics(ticker, period ?? 'ttm', limit ?? 5, this.config.financialDataApiKey);
          } catch (error) {
            console.error('getFinancialMetrics error:', error);
            throw error;
          }
        },
      },
      searchStocksByFilters: {
        description: 'Search for stocks based on financial criteria (e.g. market cap). NOTE: this data provider does not currently support stock screening on the free plan, so this tool may return empty results. If it returns no results, tell the user screening is temporarily unavailable.',
        parameters: z.object({
          filters: z.array(
            z.object({
              field: z.enum(['market_cap', 'price', 'volume', 'beta', 'dividend'] as [string, ...string[]]),
              operator: z.enum(['gt', 'gte', 'lt', 'lte', 'eq']),
              value: z.number(),
            })
          ).describe('The filters to search for (e.g. [{field: "market_cap", operator: "gt", value: 100000000000}])'),
          limit: z.number().optional().default(5).describe('The number of stocks to return'),
        }),
        execute: async ({ filters, limit }: {
          filters: Array<{
            field: string;
            operator: 'gt' | 'gte' | 'lt' | 'lte' | 'eq';
            value: number;
          }>;
          limit?: number;
        }) => {
          if (!this.shouldExecuteToolCall('searchStocksByFilters', { filters, limit })) {
            return null;
          }

          this.config.dataStream.writeData({
            type: 'tool-loading',
            content: {
              tool: 'searchStocksByFilters',
              isLoading: true,
              message: 'Searching for stocks matching your criteria...',
            },
          });

          const data = await searchStocks(filters, limit ?? 5, this.config.financialDataApiKey);

          this.config.dataStream.writeData({
            type: 'tool-loading',
            content: {
              tool: 'searchStocksByFilters',
              isLoading: false,
              message: null,
            },
          });

          return data;
        },
      },
    };
  }
}
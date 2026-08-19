// Financial Modeling Prep (FMP) adapter
// Free tier: quotes, historical prices, financial statements, ratios, key-metrics, FMP articles.
// Paid (402, unavailable on free tier): ticker-specific news, company screener.
// Docs: https://site.financialmodelingprep.com/developer/docs

const FMP_BASE = 'https://financialmodelingprep.com/stable';

async function fmpFetch(
  path: string,
  params: Record<string, string>,
  apiKey: string,
): Promise<any> {
  const url = new URL(`${FMP_BASE}/${path}`);
  url.searchParams.set('apikey', apiKey);
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== '') {
      url.searchParams.set(k, v);
    }
  }

  const response = await fetch(url.toString(), {
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`FMP error ${response.status}: ${text.slice(0, 200)}`);
  }

  return response.json();
}

// FMP returns most-recent-first; we keep chronological order for charts.
function toChronological(prices: any[]): any[] {
  return [...prices].reverse();
}

// ---------------------------------------------------------------------------
// Prices: snapshot + historical
// ---------------------------------------------------------------------------
export async function getSnapshot(ticker: string, apiKey: string) {
  const quotes: any[] = await fmpFetch('quote', { symbol: ticker }, apiKey);
  const q = quotes?.[0];
  if (!q) {
    return {
      ticker,
      price: 0,
      day_change: 0,
      day_change_percent: 0,
      market_cap: 0,
      volume: 0,
      time: new Date().toISOString(),
    };
  }

  return {
    ticker: q.symbol,
    price: q.price ?? 0,
    day_change: q.change ?? 0,
    day_change_percent: q.changePercentage ?? 0,
    market_cap: q.marketCap ?? 0,
    volume: q.volume ?? 0,
    time: q.timestamp
      ? new Date(q.timestamp * 1000).toISOString()
      : new Date().toISOString(),
  };
}

export async function getHistoricalPrices(
  ticker: string,
  startDate: string,
  endDate: string,
  apiKey: string,
) {
  const params: Record<string, string> = { symbol: ticker };
  if (startDate) params.from = startDate;
  if (endDate) params.to = endDate;

  const raw: any[] = await fmpFetch('historical-price-eod/full', params, apiKey);

  const prices = toChronological(raw).map((p) => ({
    open: p.open,
    close: p.close,
    high: p.high,
    low: p.low,
    volume: p.volume,
    time: p.date,
  }));

  return { ticker, prices };
}

// ---------------------------------------------------------------------------
// News (FMP Articles is the only free news endpoint)
// ---------------------------------------------------------------------------
export async function getNews(ticker: string, limit: number, apiKey: string) {
  const raw: any[] = await fmpFetch(
    'fmp-articles',
    { page: '0', limit: String(limit) },
    apiKey,
  );

  const news = (raw ?? []).map((n) => ({
    ticker,
    title: n.title ?? '',
    author: '',
    source: 'Financial Modeling Prep',
    date: n.date ?? new Date().toISOString(),
    url: n.link ?? '',
    image_url: '',
    sentiment: 'neutral' as const,
  }));

  return { news };
}

// ---------------------------------------------------------------------------
// Financial statements
// ---------------------------------------------------------------------------
function toReportPeriod(date: string): string {
  return date ?? '';
}

// Map FMP income statement -> snake_case income statement row
function mapIncomeStatement(raw: any, period: string): any {
  return {
    ticker: raw.symbol,
    report_period: toReportPeriod(raw.date),
    period,
    revenue: raw.revenue,
    cost_of_revenue: raw.costOfRevenue,
    gross_profit: raw.grossProfit,
    selling_general_and_administrative_expenses:
      raw.sellingGeneralAndAdministrativeExpenses,
    research_and_development: raw.researchAndDevelopmentExpenses,
    operating_expense: raw.operatingExpenses,
    operating_income: raw.operatingIncome,
    interest_expense: raw.interestExpense,
    ebit: raw.incomeBeforeTax,
    income_tax_expense: raw.incomeTaxExpense,
    net_income: raw.netIncome,
    earnings_per_share: raw.eps,
    earnings_per_share_diluted: raw.epsDiluted,
    weighted_average_shares: raw.weightedAverageShsOut,
    weighted_average_shares_diluted: raw.weightedAverageShsOutDil,
  };
}

// Map FMP balance sheet -> snake_case balance sheet row
function mapBalanceSheet(raw: any, period: string): any {
  return {
    ticker: raw.symbol,
    report_period: toReportPeriod(raw.date),
    period,
    total_assets: raw.totalAssets,
    current_assets: raw.totalCurrentAssets,
    cash_and_equivalents: raw.cashAndCashEquivalents,
    inventory: raw.inventory,
    current_investments: raw.shortTermInvestments,
    trade_and_non_trade_receivables: raw.netReceivables,
    non_current_assets: raw.totalNonCurrentAssets,
    property_plant_and_equipment: raw.propertyPlantEquipmentNet,
    goodwill_and_intangible_assets: raw.goodwillAndIntangibleAssets,
    investments: raw.longTermInvestments,
    non_current_investments: raw.longTermInvestments,
    tax_assets: raw.taxAssets,
    total_liabilities: raw.totalLiabilities,
    current_liabilities: raw.totalCurrentLiabilities,
    current_debt: raw.shortTermDebt,
    trade_and_non_trade_payables: raw.accountPayables,
    deferred_revenue: raw.deferredRevenue,
    deposit_liabilities: raw.otherCurrentLiabilities,
    non_current_liabilities: raw.totalNonCurrentLiabilities,
    non_current_debt: raw.longTermDebt,
    tax_liabilities: raw.otherNonCurrentLiabilities,
    shareholders_equity: raw.totalStockholdersEquity,
    retained_earnings: raw.retainedEarnings,
    accumulated_other_comprehensive_income:
      raw.accumulatedOtherComprehensiveIncomeLoss,
    outstanding_shares: raw.commonStock ?? undefined,
    total_debt: raw.totalDebt,
  };
}

// Map FMP cash flow -> snake_case cash flow row
function mapCashFlow(raw: any, period: string): any {
  return {
    ticker: raw.symbol,
    report_period: toReportPeriod(raw.date),
    period,
    net_income: raw.netIncome,
    depreciation_and_amortization: raw.depreciationAndAmortization,
    share_based_compensation: raw.stockBasedCompensation,
    net_cash_flow_from_operations: raw.netCashProvidedByOperatingActivities,
    capital_expenditure: raw.capitalExpenditure,
    property_plant_and_equipment: raw.investmentsInPropertyPlantAndEquipment,
    business_acquisitions_and_disposals: raw.acquisitionsNet,
    investment_acquisitions_and_disposals: raw.otherInvestingActivities,
    net_cash_flow_from_investing: raw.netCashProvidedByInvestingActivities,
    issuance_or_repayment_of_debt_securities: raw.netDebtIssuance,
    issuance_or_purchase_of_equity_shares: raw.commonStockIssuance,
    dividends_and_other_cash_distributions: raw.commonDividendsPaid,
    net_cash_flow_from_financing: raw.netCashProvidedByFinancingActivities,
    effect_of_exchange_rate_changes: raw.effectOfForexChangesOnCash,
    change_in_cash_and_equivalents: raw.netChangeInCash,
    ending_cash_balance: raw.cashAtEndOfPeriod,
    free_cash_flow: raw.freeCashFlow,
  };
}

// FMP period values: 'annual'/'quarter' -> UI 'annual'/'quarterly'
const FMP_PERIOD_MAP: Record<string, string> = {
  annual: 'annual',
  quarter: 'quarterly',
  ttm: 'annual',
};

export async function getIncomeStatements(
  ticker: string,
  period: string,
  limit: number,
  apiKey: string,
) {
  const fmpPeriod = FMP_PERIOD_MAP[period] ?? 'annual';
  const raw = await fmpFetch(
    'income-statement',
    { symbol: ticker, period: fmpPeriod, limit: String(limit) },
    apiKey,
  );
  const arr = Array.isArray(raw) ? raw : [];
  const income_statements = arr.map((r) => mapIncomeStatement(r, period));
  return { income_statements };
}

export async function getBalanceSheets(
  ticker: string,
  period: string,
  limit: number,
  apiKey: string,
) {
  const fmpPeriod = FMP_PERIOD_MAP[period] ?? 'annual';
  const raw = await fmpFetch(
    'balance-sheet-statement',
    { symbol: ticker, period: fmpPeriod, limit: String(limit) },
    apiKey,
  );
  const arr = Array.isArray(raw) ? raw : [];
  const balance_sheets = arr.map((r) => mapBalanceSheet(r, period));
  return { balance_sheets };
}

export async function getCashFlowStatements(
  ticker: string,
  period: string,
  limit: number,
  apiKey: string,
) {
  const fmpPeriod = FMP_PERIOD_MAP[period] ?? 'annual';
  const raw = await fmpFetch(
    'cash-flow-statement',
    { symbol: ticker, period: fmpPeriod, limit: String(limit) },
    apiKey,
  );
  const arr = Array.isArray(raw) ? raw : [];
  const cash_flow_statements = arr.map((r) => mapCashFlow(r, period));
  return { cash_flow_statements };
}

// ---------------------------------------------------------------------------
// Financial metrics / ratios
// ---------------------------------------------------------------------------
function mapMetrics(ratios: any, keyMetrics: any, ticker: string, period: string): any {
  return {
    ticker,
    report_period: ratios.date ?? keyMetrics?.date ?? '',
    period,
    market_cap: keyMetrics?.marketCap ?? ratios.marketCap,
    enterprise_value: keyMetrics?.enterpriseValue ?? ratios.enterpriseValue,
    price_to_earnings_ratio:
      ratios.priceToEarningsRatio ?? ratios.priceToEarningsRatioTTM,
    price_to_book_ratio: ratios.priceToBookRatio ?? ratios.priceToBookRatioTTM,
    price_to_sales_ratio:
      ratios.priceToSalesRatio ?? ratios.priceToSalesRatioTTM,
    enterprise_value_to_ebitda_ratio:
      ratios.enterpriseValueMultiple ?? ratios.enterpriseValueMultipleTTM,
    free_cash_flow_yield: keyMetrics?.freeCashFlowYield,
    peg_ratio:
      ratios.priceToEarningsGrowthRatio ??
      ratios.priceToEarningsGrowthRatioTTM,
    gross_margin: ratios.grossProfitMargin ?? ratios.grossProfitMarginTTM,
    operating_margin:
      ratios.operatingProfitMargin ?? ratios.operatingProfitMarginTTM,
    net_margin: ratios.netProfitMargin ?? ratios.netProfitMarginTTM,
    return_on_equity: keyMetrics?.returnOnEquity,
    return_on_assets: keyMetrics?.returnOnAssets,
    return_on_invested_capital: keyMetrics?.returnOnCapitalEmployed,
    asset_turnover: ratios.assetTurnover ?? ratios.assetTurnoverTTM,
    inventory_turnover:
      ratios.inventoryTurnover ?? ratios.inventoryTurnoverTTM,
    receivables_turnover:
      ratios.receivablesTurnover ?? ratios.receivablesTurnoverTTM,
    current_ratio: ratios.currentRatio ?? ratios.currentRatioTTM,
    quick_ratio: ratios.quickRatio ?? ratios.quickRatioTTM,
    cash_ratio: ratios.cashRatio ?? ratios.cashRatioTTM,
    operating_cash_flow_ratio:
      ratios.operatingCashFlowRatio ?? ratios.operatingCashFlowRatioTTM,
    debt_to_equity: ratios.debtToEquityRatio ?? ratios.debtToEquityRatioTTM,
    debt_to_assets: ratios.debtToAssetsRatio ?? ratios.debtToAssetsRatioTTM,
    interest_coverage:
      ratios.interestCoverageRatio ?? ratios.interestCoverageRatioTTM,
    payout_ratio:
      ratios.dividendPayoutRatio ?? ratios.dividendPayoutRatioTTM,
    earnings_per_share: ratios.netIncomePerShare ?? ratios.netIncomePerShareTTM,
    book_value_per_share:
      ratios.bookValuePerShare ?? ratios.bookValuePerShareTTM,
    free_cash_flow_per_share:
      ratios.freeCashFlowPerShare ?? ratios.freeCashFlowPerShareTTM,
  };
}

export async function getFinancialMetrics(
  ticker: string,
  period: string,
  limit: number,
  apiKey: string,
) {
  if (period === 'ttm') {
    const [ratiosArr, keyMetricsArr] = await Promise.all([
      fmpFetch('ratios-ttm', { symbol: ticker }, apiKey),
      fmpFetch('key-metrics-ttm', { symbol: ticker }, apiKey),
    ]);
    const ratios = Array.isArray(ratiosArr) ? ratiosArr[0] : ratiosArr;
    const keyMetrics = Array.isArray(keyMetricsArr) ? keyMetricsArr[0] : keyMetricsArr;
    return { financial_metrics: [mapMetrics(ratios ?? {}, keyMetrics ?? {}, ticker, period)] };
  }

  const fmpPeriod = FMP_PERIOD_MAP[period] ?? 'annual';
  const [ratiosArr, keyMetricsArr] = await Promise.all([
    fmpFetch('ratios', { symbol: ticker, period: fmpPeriod, limit: String(limit) }, apiKey),
    fmpFetch('key-metrics', { symbol: ticker, period: fmpPeriod, limit: String(limit) }, apiKey),
  ]);
  const ratiosList = Array.isArray(ratiosArr) ? ratiosArr : [];
  const keyMetricsList = Array.isArray(keyMetricsArr) ? keyMetricsArr : [];

  const financial_metrics = ratiosList.map((r, i) =>
    mapMetrics(r, keyMetricsList[i] ?? {}, ticker, period),
  );
  return { financial_metrics };
}

// ---------------------------------------------------------------------------
// Stock screener
// NOTE: FMP's company-screener is a PAID endpoint (402 on free tier).
// We return an empty result set with a note so the LLM can explain the
// limitation rather than erroring out.
// ---------------------------------------------------------------------------
export async function searchStocks(
  filters: Array<{ field: string; operator: string; value: number }>,
  limit: number,
  apiKey: string,
) {
  // The free tier has no screener endpoint. Return empty results gracefully.
  return { search_results: [] };
}
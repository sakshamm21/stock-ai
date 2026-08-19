import { motion } from 'framer-motion';
import { StockAILogo } from './icons';

export const Overview = () => {
  return (
    <motion.div
      key="overview"
      className="max-w-3xl mx-auto md:mt-16"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ delay: 0.5 }}
    >
      <div className="rounded-2xl p-8 flex flex-col gap-6 leading-relaxed text-center max-w-xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="glow-primary rounded-2xl p-3 bg-primary/5">
            <StockAILogo size={56} />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            <span className="gradient-text">Stock AI</span>
          </h1>
          <p className="text-muted-foreground text-base md:text-lg max-w-md">
            Your intelligent financial assistant. Ask about stock prices,
            financial statements, market news, and more.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left"
        >
          {[
            {
              title: 'Real-time Prices',
              description: 'Live stock quotes & historical data',
              icon: '📈',
            },
            {
              title: 'Financial Statements',
              description: 'Income, balance sheets & cash flow',
              icon: '📊',
            },
            {
              title: 'Market News',
              description: 'Latest headlines & company updates',
              icon: '📰',
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="card-lift rounded-xl border bg-card/50 p-4 flex flex-col gap-1.5"
            >
              <span className="text-2xl">{feature.icon}</span>
              <span className="font-semibold text-sm">{feature.title}</span>
              <span className="text-xs text-muted-foreground">
                {feature.description}
              </span>
            </div>
          ))}
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
          className="text-xs text-muted-foreground"
        >
          Type <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono">@</code> to
          quickly reference stock tickers
        </motion.p>
      </div>
    </motion.div>
  );
};
import { useMemo } from "react";
import { Deal, DealTag } from "./useDealFlow";

export interface DealFlowStats {
  byTag: Record<DealTag, number>;
  conversionRate: number;
  avgTimeToClose: number;
  total: number;
  activeDeals: number;
}

export const useDealFlowStats = (deals: Deal[]): DealFlowStats => {
  return useMemo(() => {
    const byTag: Record<DealTag, number> = {
      LEAD: 0,
      CONTATO: 0,
      DOCS: 0,
      ANALISANDO: 0,
      FECHADO: 0,
      PASSOU: 0,
    };

    // Count deals per tag
    deals.forEach(deal => {
      deal.tags.forEach(tag => {
        if (tag in byTag) {
          byTag[tag as DealTag]++;
        }
      });
    });

    // Calculate conversion rate
    const closedDeals = byTag.FECHADO + byTag.PASSOU;
    const conversionRate = closedDeals > 0 
      ? (byTag.FECHADO / closedDeals) * 100 
      : 0;

    // Calculate average time to close (in days)
    const closedWithTime = deals.filter(d => d.closed_at !== null);
    let avgTimeToClose = 0;
    
    if (closedWithTime.length > 0) {
      const totalDays = closedWithTime.reduce((sum, deal) => {
        const created = new Date(deal.created_at).getTime();
        const closed = new Date(deal.closed_at!).getTime();
        const diffDays = (closed - created) / (1000 * 60 * 60 * 24);
        return sum + diffDays;
      }, 0);
      avgTimeToClose = Math.round(totalDays / closedWithTime.length);
    }

    // Active deals (not closed or passed)
    const activeDeals = deals.filter(deal => 
      !deal.tags.includes('FECHADO') && !deal.tags.includes('PASSOU')
    ).length;

    return {
      byTag,
      conversionRate: Math.round(conversionRate * 10) / 10,
      avgTimeToClose,
      total: deals.length,
      activeDeals,
    };
  }, [deals]);
};

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ChartBar as BarChart3, Filter, TrendingUp, TrendingDown, DollarSign, Package, Calendar, Award, TriangleAlert as AlertTriangle, Star, CircleCheck as CheckCircle } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import { ProductStats, RegistryFilter } from '@/types';

const { width } = Dimensions.get('window');

const FILTER_OPTIONS = [
  { type: 'best-selling', label: 'Más vendido', icon: TrendingUp },
  { type: 'worst-selling', label: 'Menos vendido', icon: TrendingDown },
  { type: 'most-profitable', label: 'Más rentable', icon: DollarSign },
  { type: 'least-profitable', label: 'Menos rentable', icon: AlertTriangle },
];

const PERIOD_OPTIONS = [
  { value: 'weekly', label: 'Semanal' },
  { value: 'monthly', label: 'Mensual' },
];

export default function RegistryScreen() {
  const { products, sales } = useApp();
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [currentFilter, setCurrentFilter] = useState<RegistryFilter>({
    type: 'best-selling',
    period: 'weekly',
  });

  const productStats = useMemo(() => {
    const stats: ProductStats[] = products.map(product => {
      const productSales = sales.filter(sale => sale.productId === product.id);
      
      // Filter by period
      const now = new Date();
      const filteredSales = productSales.filter(sale => {
        const saleDate = new Date(sale.date);
        const timeDiff = now.getTime() - saleDate.getTime();
        const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
        
        if (currentFilter.period === 'weekly') {
          return daysDiff <= 7;
        } else {
          return daysDiff <= 30;
        }
      });

      const totalSold = filteredSales.reduce((sum, sale) => sum + sale.quantity, 0);
      const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.totalPrice, 0);
      const costPerUnit = product.investment / product.lotQuantity;
      const totalCost = totalSold * costPerUnit;
      const profit = totalRevenue - totalCost;

      return {
        productId: product.id,
        productName: product.name,
        totalSold,
        totalRevenue,
        remainingQuantity: product.availableQuantity,
        profit,
        investment: totalCost,
      };
    });

    // Sort based on filter type
    switch (currentFilter.type) {
      case 'best-selling':
        return stats.sort((a, b) => b.totalSold - a.totalSold);
      case 'worst-selling':
        return stats.sort((a, b) => a.totalSold - b.totalSold);
      case 'most-profitable':
        return stats.sort((a, b) => b.profit - a.profit);
      case 'least-profitable':
        return stats.sort((a, b) => a.profit - b.profit);
      default:
        return stats;
    }
  }, [products, sales, currentFilter]);

  const totalStats = useMemo(() => {
    return productStats.reduce(
      (acc, stat) => ({
        totalRevenue: acc.totalRevenue + stat.totalRevenue,
        totalProfit: acc.totalProfit + stat.profit,
        totalInvestment: acc.totalInvestment + stat.investment,
        totalSold: acc.totalSold + stat.totalSold,
      }),
      { totalRevenue: 0, totalProfit: 0, totalInvestment: 0, totalSold: 0 }
    );
  }, [productStats]);

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  const getProfitColor = (profit: number) => {
    if (profit > 0) return '#059669';
    if (profit < 0) return '#dc2626';
    return '#64748b';
  };

  const getInvestmentQuality = (profit: number, investment: number) => {
    if (investment === 0) return { ratio: 0, quality: 'unknown', color: '#64748b', icon: AlertTriangle };
    
    const ratio = profit / investment;
    
    if (ratio >= 0.5) {
      return { ratio, quality: 'excellent', color: '#059669', icon: Star };
    } else if (ratio >= 0.25) {
      return { ratio, quality: 'good', color: '#3b82f6', icon: CheckCircle };
    } else if (ratio >= 0) {
      return { ratio, quality: 'poor', color: '#f59e0b', icon: AlertTriangle };
    } else {
      return { ratio, quality: 'loss', color: '#dc2626', icon: AlertTriangle };
    }
  };

  const getQualityLabel = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'Excelente';
      case 'good': return 'Buena';
      case 'poor': return 'Pobre';
      case 'loss': return 'Pérdida';
      default: return 'Desconocida';
    }
  };

  const getFilterIcon = (type: string) => {
    const option = FILTER_OPTIONS.find(opt => opt.type === type);
    return option ? option.icon : Filter;
  };

  const getFilterLabel = (type: string) => {
    const option = FILTER_OPTIONS.find(opt => opt.type === type);
    return option ? option.label : type;
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1e40af', '#3b82f6']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>Registro</Text>
            <Text style={styles.headerSubtitle}>
              Análisis {currentFilter.period === 'weekly' ? 'semanal' : 'mensual'}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setFilterModalVisible(true)}
          >
            <Filter color="#ffffff" size={20} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Summary Cards */}
        <View style={styles.summaryGrid}>
          <View style={styles.summaryCard}>
            <DollarSign color="#059669" size={24} />
            <Text style={styles.summaryValue}>{formatCurrency(totalStats.totalRevenue)}</Text>
            <Text style={styles.summaryLabel}>Ingresos</Text>
          </View>
          
          <View style={styles.summaryCard}>
            <TrendingUp color="#3b82f6" size={24} />
            <Text style={[styles.summaryValue, { color: getProfitColor(totalStats.totalProfit) }]}>
              {formatCurrency(totalStats.totalProfit)}
            </Text>
            <Text style={styles.summaryLabel}>Ganancia</Text>
          </View>

          <View style={styles.summaryCard}>
            <Package color="#7c3aed" size={24} />
            <Text style={styles.summaryValue}>{totalStats.totalSold}</Text>
            <Text style={styles.summaryLabel}>Vendidos</Text>
          </View>

          <View style={styles.summaryCard}>
            <BarChart3 color="#f59e0b" size={24} />
            <Text style={styles.summaryValue}>{formatCurrency(totalStats.totalInvestment)}</Text>
            <Text style={styles.summaryLabel}>Inversión</Text>
          </View>
        </View>

        {/* Current Filter Display */}
        <View style={styles.currentFilter}>
          <View style={styles.currentFilterHeader}>
            {React.createElement(getFilterIcon(currentFilter.type), {
              color: '#3b82f6',
              size: 20,
            })}
            <Text style={styles.currentFilterText}>
              {getFilterLabel(currentFilter.type)} - {currentFilter.period === 'weekly' ? 'Semanal' : 'Mensual'}
            </Text>
          </View>
        </View>

        {/* Products List */}
        {productStats.length === 0 ? (
          <View style={styles.emptyState}>
            <BarChart3 color="#94a3b8" size={64} />
            <Text style={styles.emptyTitle}>No hay datos disponibles</Text>
            <Text style={styles.emptyDescription}>
              Agrega productos y ventas para ver el análisis
            </Text>
          </View>
        ) : (
          <View style={styles.productsList}>
            {productStats.map((stat, index) => {
              const investmentQuality = getInvestmentQuality(stat.profit, stat.investment);
              
              return (
                <View key={stat.productId} style={styles.productStatCard}>
                  <View style={styles.productStatHeader}>
                    <View style={styles.rankBadge}>
                      <Text style={styles.rankText}>#{index + 1}</Text>
                    </View>
                    <View style={styles.productStatInfo}>
                      <Text style={styles.productStatName}>{stat.productName}</Text>
                      <Text style={styles.productStatMetric}>
                        {currentFilter.type.includes('selling') 
                          ? `${stat.totalSold} vendidos`
                          : `${formatCurrency(stat.profit)} ganancia`
                        }
                      </Text>
                    </View>
                    <View style={styles.headerIcons}>
                      {index === 0 && (
                        <Award color="#fbbf24" size={24} />
                      )}
                      <View style={[styles.qualityBadge, { backgroundColor: investmentQuality.color }]}>
                        {React.createElement(investmentQuality.icon, {
                          color: '#ffffff',
                          size: 16,
                        })}
                      </View>
                    </View>
                  </View>

                  {/* Investment Quality Indicator */}
                  <View style={styles.qualitySection}>
                    <Text style={styles.qualityLabel}>Calidad de Inversión:</Text>
                    <View style={styles.qualityInfo}>
                      <Text style={[styles.qualityText, { color: investmentQuality.color }]}>
                        {getQualityLabel(investmentQuality.quality)}
                      </Text>
                      <Text style={styles.qualityRatio}>
                        ({(investmentQuality.ratio * 100).toFixed(1)}% ROI)
                      </Text>
                    </View>
                  </View>

                  <View style={styles.productStatDetails}>
                    <View style={styles.statRow}>
                      <Text style={styles.statLabel}>Vendido:</Text>
                      <Text style={styles.statValue}>{stat.totalSold} unidades</Text>
                    </View>
                    
                    <View style={styles.statRow}>
                      <Text style={styles.statLabel}>Disponible:</Text>
                      <Text style={styles.statValue}>{stat.remainingQuantity} unidades</Text>
                    </View>

                    <View style={styles.statRow}>
                      <Text style={styles.statLabel}>Ingresos:</Text>
                      <Text style={[styles.statValue, { color: '#059669' }]}>
                        {formatCurrency(stat.totalRevenue)}
                      </Text>
                    </View>

                    <View style={styles.statRow}>
                      <Text style={styles.statLabel}>Inversión:</Text>
                      <Text style={styles.statValue}>{formatCurrency(stat.investment)}</Text>
                    </View>

                    <View style={styles.statRow}>
                      <Text style={styles.statLabel}>Ganancia:</Text>
                      <Text style={[styles.statValue, { color: getProfitColor(stat.profit) }]}>
                        {formatCurrency(stat.profit)}
                      </Text>
                    </View>
                  </View>

                  {/* Progress Bar */}
                  <View style={styles.progressSection}>
                    <Text style={styles.progressLabel}>Stock</Text>
                    <View style={styles.progressBar}>
                      <View style={styles.progressBackground}>
                        <View 
                          style={[
                            styles.progressFill, 
                            { 
                              width: `${Math.max(
                                (stat.remainingQuantity / (stat.remainingQuantity + stat.totalSold)) * 100, 
                                5
                              )}%` 
                            }
                          ]} 
                        />
                      </View>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Filter Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={filterModalVisible}
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Filtros de Análisis</Text>

            {/* Filter Type */}
            <Text style={styles.sectionTitle}>Tipo de análisis</Text>
            <View style={styles.filterOptions}>
              {FILTER_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.type}
                  style={[
                    styles.filterOption,
                    currentFilter.type === option.type && styles.filterOptionSelected
                  ]}
                  onPress={() => setCurrentFilter(prev => ({ ...prev, type: option.type as any }))}
                >
                  {React.createElement(option.icon, {
                    color: currentFilter.type === option.type ? '#ffffff' : '#64748b',
                    size: 20,
                  })}
                  <Text style={[
                    styles.filterOptionText,
                    currentFilter.type === option.type && styles.filterOptionTextSelected
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Period */}
            <Text style={styles.sectionTitle}>Período</Text>
            <View style={styles.periodOptions}>
              {PERIOD_OPTIONS.map((period) => (
                <TouchableOpacity
                  key={period.value}
                  style={[
                    styles.periodOption,
                    currentFilter.period === period.value && styles.periodOptionSelected
                  ]}
                  onPress={() => setCurrentFilter(prev => ({ ...prev, period: period.value as any }))}
                >
                  <Calendar 
                    color={currentFilter.period === period.value ? '#ffffff' : '#64748b'} 
                    size={18} 
                  />
                  <Text style={[
                    styles.periodOptionText,
                    currentFilter.period === period.value && styles.periodOptionTextSelected
                  ]}>
                    {period.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Close Button */}
            <TouchableOpacity
              style={styles.closeModalButton}
              onPress={() => setFilterModalVisible(false)}
            >
              <LinearGradient
                colors={['#2563eb', '#1d4ed8']}
                style={styles.closeModalButtonGradient}
              >
                <Text style={styles.closeModalButtonText}>Aplicar Filtros</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#bfdbfe',
  },
  filterButton: {
    width: 44,
    height: 44,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  summaryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    width: (width - 52) / 2,
    alignItems: 'center',
    shadowColor: '#1e40af',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  summaryValue: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#1e293b',
    marginTop: 8,
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  currentFilter: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#1e40af',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  currentFilterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  currentFilterText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1e293b',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#475569',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#94a3b8',
    textAlign: 'center',
  },
  productsList: {
    gap: 16,
  },
  productStatCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#1e40af',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  productStatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  rankBadge: {
    width: 32,
    height: 32,
    backgroundColor: '#3b82f6',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankText: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
  },
  productStatInfo: {
    flex: 1,
  },
  productStatName: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#1e293b',
    marginBottom: 2,
  },
  productStatMetric: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#3b82f6',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  qualityBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qualitySection: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  qualityLabel: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  qualityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  qualityText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
  qualityRatio: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748b',
  },
  productStatDetails: {
    gap: 8,
    marginBottom: 16,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748b',
  },
  statValue: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#1e293b',
  },
  progressSection: {
    gap: 8,
  },
  progressLabel: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  progressBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressBackground: {
    flex: 1,
    height: 6,
    backgroundColor: '#e2e8f0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 3,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1e293b',
    marginBottom: 24,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1e293b',
    marginBottom: 12,
    marginTop: 16,
  },
  filterOptions: {
    gap: 8,
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  filterOptionSelected: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  filterOptionText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#64748b',
  },
  filterOptionTextSelected: {
    color: '#ffffff',
    fontFamily: 'Inter-SemiBold',
  },
  periodOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  periodOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  periodOptionSelected: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  periodOptionText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#64748b',
  },
  periodOptionTextSelected: {
    color: '#ffffff',
    fontFamily: 'Inter-SemiBold',
  },
  closeModalButton: {
    marginTop: 24,
    borderRadius: 12,
  },
  closeModalButtonGradient: {
    paddingVertical: 16,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeModalButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
});
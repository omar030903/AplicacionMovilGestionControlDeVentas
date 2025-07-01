import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Modal,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Package, Plus, DollarSign, Scale, Truck, Trash2, CreditCard as Edit3 } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';

const { width } = Dimensions.get('window');

const UNITS = [
  { value: 'kg', label: 'Kilogramos (kg)' },
  { value: 'lb', label: 'Libras (lb)' },
  { value: 'litros', label: 'Litros' },
  { value: 'unidad', label: 'Unidad' },
];

export default function ProductsScreen() {
  const { products, addProduct, deleteProduct } = useApp();
  const [modalVisible, setModalVisible] = useState(false);
  const [unitModalVisible, setUnitModalVisible] = useState(false);
  
  // Form state
  const [name, setName] = useState('');
  const [pricePerUnit, setPricePerUnit] = useState('');
  const [unit, setUnit] = useState<'kg' | 'lb' | 'litros' | 'unidad'>('unidad');
  const [standardQuantity, setStandardQuantity] = useState('');
  const [lotQuantity, setLotQuantity] = useState('');
  const [investment, setInvestment] = useState('');

  const resetForm = () => {
    setName('');
    setPricePerUnit('');
    setUnit('unidad');
    setStandardQuantity('');
    setLotQuantity('');
    setInvestment('');
  };

  const handleAddProduct = () => {
    if (!name || !pricePerUnit || !lotQuantity || !investment) {
      Alert.alert('Error', 'Por favor completa todos los campos obligatorios');
      return;
    }

    const price = parseFloat(pricePerUnit);
    const lot = parseFloat(lotQuantity);
    const invest = parseFloat(investment);
    const standard = standardQuantity ? parseFloat(standardQuantity) : undefined;

    if (price <= 0 || lot <= 0 || invest <= 0) {
      Alert.alert('Error', 'Los valores numéricos deben ser mayores a cero');
      return;
    }

    addProduct({
      name: name.trim(),
      pricePerUnit: price,
      unit,
      standardQuantity: standard,
      lotQuantity: lot,
      investment: invest,
    });

    resetForm();
    setModalVisible(false);
    Alert.alert('Éxito', 'Producto añadido correctamente');
  };

  const handleDeleteProduct = (productId: string, productName: string) => {
    Alert.alert(
      'Eliminar Producto',
      `¿Estás seguro de que quieres eliminar "${productName}"?\n\nEsta acción también eliminará todas las ventas relacionadas con este producto.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            deleteProduct(productId);
            Alert.alert('Éxito', 'Producto eliminado correctamente');
          },
        },
      ]
    );
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  const getUnitLabel = (unitValue: string) => {
    const foundUnit = UNITS.find(u => u.value === unitValue);
    return foundUnit ? foundUnit.label : unitValue;
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1e40af', '#3b82f6']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Productos</Text>
        <Text style={styles.headerSubtitle}>
          {products.length} {products.length === 1 ? 'producto registrado' : 'productos registrados'}
        </Text>
      </LinearGradient>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {products.length === 0 ? (
          <View style={styles.emptyState}>
            <Package color="#94a3b8" size={64} />
            <Text style={styles.emptyTitle}>No hay productos registrados</Text>
            <Text style={styles.emptyDescription}>
              Comienza agregando tu primer producto
            </Text>
          </View>
        ) : (
          <View style={styles.productGrid}>
            {products.map((product) => (
              <View key={product.id} style={styles.productCard}>
                <View style={styles.productHeader}>
                  <View style={styles.productIcon}>
                    <Package color="#3b82f6" size={24} />
                  </View>
                  <View style={styles.productInfo}>
                    <Text style={styles.productName}>{product.name}</Text>
                    <Text style={styles.productUnit}>por {product.unit}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteProduct(product.id, product.name)}
                  >
                    <Trash2 color="#dc2626" size={20} />
                  </TouchableOpacity>
                </View>

                <View style={styles.productStats}>
                  <View style={styles.statItem}>
                    <DollarSign color="#059669" size={16} />
                    <Text style={styles.statValue}>{formatCurrency(product.pricePerUnit)}</Text>
                  </View>
                  
                  <View style={styles.statItem}>
                    <Scale color="#dc2626" size={16} />
                    <Text style={styles.statValue}>{product.availableQuantity}</Text>
                    <Text style={styles.statLabel}>disponible</Text>
                  </View>

                  <View style={styles.statItem}>
                    <Truck color="#7c3aed" size={16} />
                    <Text style={styles.statValue}>{formatCurrency(product.investment)}</Text>
                    <Text style={styles.statLabel}>inversión</Text>
                  </View>
                </View>

                {product.standardQuantity && (
                  <View style={styles.standardQuantityBadge}>
                    <Text style={styles.standardQuantityText}>
                      Estándar: {product.standardQuantity}
                    </Text>
                  </View>
                )}

                <View style={styles.progressBar}>
                  <View style={styles.progressBackground}>
                    <View 
                      style={[
                        styles.progressFill, 
                        { width: `${Math.min((product.availableQuantity / product.lotQuantity) * 100, 100)}%` }
                      ]} 
                    />
                  </View>
                  <Text style={styles.progressText}>
                    {product.availableQuantity} / {product.lotQuantity}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Add Product FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
      >
        <LinearGradient
          colors={['#2563eb', '#1d4ed8']}
          style={styles.fabGradient}
        >
          <Plus color="#ffffff" size={24} />
        </LinearGradient>
      </TouchableOpacity>

      {/* Add Product Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>Nuevo Producto</Text>

              {/* Product Name */}
              <Text style={styles.fieldLabel}>Nombre del producto *</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Ej: Arroz, Aceite, etc."
                placeholderTextColor="#94a3b8"
              />

              {/* Price per Unit */}
              <Text style={styles.fieldLabel}>Precio por unidad *</Text>
              <TextInput
                style={styles.input}
                value={pricePerUnit}
                onChangeText={setPricePerUnit}
                placeholder="0.00"
                keyboardType="decimal-pad"
                placeholderTextColor="#94a3b8"
              />

              {/* Unit Selection */}
              <Text style={styles.fieldLabel}>Unidad de medida *</Text>
              <TouchableOpacity
                style={styles.unitSelector}
                onPress={() => setUnitModalVisible(true)}
              >
                <Text style={styles.unitSelectorText}>
                  {getUnitLabel(unit)}
                </Text>
              </TouchableOpacity>

              {/* Standard Quantity */}
              <Text style={styles.fieldLabel}>Cantidad estándar (opcional)</Text>
              <TextInput
                style={styles.input}
                value={standardQuantity}
                onChangeText={setStandardQuantity}
                placeholder="Cantidad típica de venta"
                keyboardType="decimal-pad"
                placeholderTextColor="#94a3b8"
              />

              {/* Lot Quantity */}
              <Text style={styles.fieldLabel}>Cantidad del lote *</Text>
              <TextInput
                style={styles.input}
                value={lotQuantity}
                onChangeText={setLotQuantity}
                placeholder="Cantidad total disponible"
                keyboardType="decimal-pad"
                placeholderTextColor="#94a3b8"
              />

              {/* Investment */}
              <Text style={styles.fieldLabel}>Inversión *</Text>
              <TextInput
                style={styles.input}
                value={investment}
                onChangeText={setInvestment}
                placeholder="Costo total del lote"
                keyboardType="decimal-pad"
                placeholderTextColor="#94a3b8"
              />

              {/* Buttons */}
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    resetForm();
                    setModalVisible(false);
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={handleAddProduct}
                >
                  <LinearGradient
                    colors={['#2563eb', '#1d4ed8']}
                    style={styles.confirmButtonGradient}
                  >
                    <Text style={styles.confirmButtonText}>Agregar</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Unit Selection Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={unitModalVisible}
        onRequestClose={() => setUnitModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.unitModalContent}>
            <Text style={styles.modalTitle}>Seleccionar Unidad</Text>
            
            {UNITS.map((unitOption) => (
              <TouchableOpacity
                key={unitOption.value}
                style={[
                  styles.unitOption,
                  unit === unitOption.value && styles.unitOptionSelected
                ]}
                onPress={() => {
                  setUnit(unitOption.value as any);
                  setUnitModalVisible(false);
                }}
              >
                <Text style={[
                  styles.unitOptionText,
                  unit === unitOption.value && styles.unitOptionTextSelected
                ]}>
                  {unitOption.label}
                </Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setUnitModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Cerrar</Text>
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
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
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
  productGrid: {
    gap: 16,
  },
  productCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#1e40af',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  productHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  productIcon: {
    width: 48,
    height: 48,
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#1e293b',
    marginBottom: 2,
  },
  productUnit: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748b',
  },
  deleteButton: {
    width: 40,
    height: 40,
    backgroundColor: '#fef2f2',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productStats: {
    gap: 12,
    marginBottom: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statValue: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1e293b',
  },
  statLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748b',
  },
  standardQuantityBadge: {
    backgroundColor: '#fbbf24',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  standardQuantityText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
  progressBar: {
    gap: 8,
  },
  progressBackground: {
    height: 8,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#64748b',
    textAlign: 'right',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    shadowColor: '#1e40af',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    width: width - 40,
    maxHeight: '85%',
  },
  modalTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1e293b',
    marginBottom: 20,
    textAlign: 'center',
  },
  fieldLabel: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1e293b',
    backgroundColor: '#f8fafc',
  },
  unitSelector: {
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f8fafc',
  },
  unitSelectorText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1e293b',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#64748b',
    textAlign: 'center',
  },
  confirmButton: {
    flex: 1,
    borderRadius: 12,
  },
  confirmButtonGradient: {
    paddingVertical: 12,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
  unitModalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    width: width - 60,
    maxHeight: '60%',
  },
  unitOption: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#f8fafc',
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  unitOptionSelected: {
    backgroundColor: '#eff6ff',
    borderColor: '#3b82f6',
  },
  unitOptionText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1e293b',
  },
  unitOptionTextSelected: {
    color: '#3b82f6',
    fontFamily: 'Inter-SemiBold',
  },
  closeButton: {
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
  },
  closeButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#64748b',
    textAlign: 'center',
  },
});
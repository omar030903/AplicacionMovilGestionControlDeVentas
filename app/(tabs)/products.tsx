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
import { Package, Plus, DollarSign, Scale, Truck, Trash2, Pencil } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';

const { width } = Dimensions.get('window');

const UNITS = [
  { value: 'kg', label: 'Kilogramos (kg)' },
  { value: 'lb', label: 'Libras (lb)' },
  { value: 'litros', label: 'Litros' },
  { value: 'unidad', label: 'Unidad' },
];

export default function ProductsScreen() {
  const { products, addProduct, deleteProduct, updateProduct } = useApp();
  const [modalVisible, setModalVisible] = useState(false);
  const [unitModalVisible, setUnitModalVisible] = useState(false);

  // Filtro de productos
  const [filter, setFilter] = useState<'disponibles' | 'agotados' | 'todos'>('disponibles');
  const filteredProducts = products.filter(product => {
    const available = parseFloat(product.availableQuantity) > 0;
    if (filter === 'disponibles') return available;
    if (filter === 'agotados') return !available;
    return true;
  });

  // Form state
  const [name, setName] = useState('');
  const [pricePerUnit, setPricePerUnit] = useState('');
  const [unit, setUnit] = useState<'kg' | 'lb' | 'litros' | 'unidad'>('unidad');
  const [standardQuantity, setStandardQuantity] = useState('');
  const [lotQuantity, setLotQuantity] = useState('');
  const [investment, setInvestment] = useState('');

  // Add stock modal state
  const [addStockModalVisible, setAddStockModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [additionalQuantity, setAdditionalQuantity] = useState('');
  const [additionalInvestment, setAdditionalInvestment] = useState('');
  const [useCustomInvestment, setUseCustomInvestment] = useState(false);

  // Edit product modal state
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editProduct, setEditProduct] = useState<any>(null);
  const [editName, setEditName] = useState('');
  const [editPricePerUnit, setEditPricePerUnit] = useState('');
  const [editCostPerUnit, setEditCostPerUnit] = useState('');

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

    if (
      isNaN(parseFloat(pricePerUnit)) ||
      isNaN(parseFloat(lotQuantity)) ||
      isNaN(parseFloat(investment)) ||
      (standardQuantity && isNaN(parseFloat(standardQuantity)))
    ) {
      Alert.alert('Error', 'Solo se permiten números en los campos de cantidad y precios');
      return;
    }

    const price = parseFloat(pricePerUnit) || 0;
    const lot = parseFloat(lotQuantity) || 0;
    const invest = parseFloat(investment) || 0;
    const standard = standardQuantity ? parseFloat(standardQuantity) : undefined;

    if (price <= 0 || lot <= 0 || invest <= 0) {
      Alert.alert('Error', 'Los valores numéricos deben ser mayores a cero');
      return;
    }

    // Calcula el precio de inversión por unidad
    const costPerUnit = (invest / lot).toString();

    const existingProduct = products.find(
      (p) => p.name.trim().toLowerCase() === name.trim().toLowerCase() && p.unit === unit
    );
    if (existingProduct) {
      updateProduct({
        ...existingProduct,
        lotQuantity: (parseFloat(existingProduct.lotQuantity) + lot).toString(),
        availableQuantity: (parseFloat(existingProduct.availableQuantity) + lot).toString(),
        investment: (parseFloat(existingProduct.investment) + invest).toString(),
        pricePerUnit: pricePerUnit,
        costPerUnit: costPerUnit,
      });
      Alert.alert('Producto actualizado correctamente');
    } else {
      addProduct({
        name: name.trim(),
        pricePerUnit: pricePerUnit,
        costPerUnit: costPerUnit,
        unit: unit,
        standardQuantity: standardQuantity,
        lotQuantity: lotQuantity,
        availableQuantity: lotQuantity,
        investment: investment,
      });
      Alert.alert('Producto añadido correctamente');
    }

    resetForm();
    setModalVisible(false);
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
            Alert.alert('Producto eliminado correctamente');
          },
        },
      ]
    );
  };

  const openAddStockModal = (product: any) => {
    setSelectedProduct(product);
    setAdditionalQuantity('');
    setAdditionalInvestment('');
    setUseCustomInvestment(false);
    setAddStockModalVisible(true);
  };

  const handleAddStockToProduct = () => {
    if (!additionalQuantity) {
      Alert.alert('Error', 'Completa la cantidad');
      return;
    }
    if (isNaN(parseFloat(additionalQuantity))) {
      Alert.alert('Error', 'Solo se permiten números en la cantidad');
      return;
    }
    const addQty = parseFloat(additionalQuantity) || 0;
    if (isNaN(addQty) || addQty <= 0) {
      Alert.alert('Error', 'Cantidad inválida');
      return;
    }

    let addInv = 0;

    if (useCustomInvestment) {
      if (!additionalInvestment) {
        Alert.alert('Error', 'Completa la inversión');
        return;
      }
      if (isNaN(parseFloat(additionalInvestment))) {
        Alert.alert('Error', 'Solo se permiten números en la inversión');
        return;
      }
      addInv = parseFloat(additionalInvestment) || 0;
      if (isNaN(addInv) || addInv <= 0) {
        Alert.alert('Error', 'Inversión inválida');
        return;
      }
    } else {
      // Inversión automática: cantidad * precio de inversión por unidad
      addInv = addQty * (parseFloat(selectedProduct.costPerUnit) || 0);
    }

    updateProduct({
      ...selectedProduct,
      lotQuantity: ((parseFloat(selectedProduct.lotQuantity) || 0) + addQty).toString(),
      availableQuantity: ((parseFloat(selectedProduct.availableQuantity) || 0) + addQty).toString(),
      investment: ((parseFloat(selectedProduct.investment) || 0) + addInv).toString(),
      pricePerUnit: selectedProduct.pricePerUnit,
      costPerUnit: selectedProduct.costPerUnit,
    });
    setAddStockModalVisible(false);
    Alert.alert('Stock añadido correctamente');
  };

  // Edit product logic
  const openEditProductModal = (product: any) => {
    setEditProduct(product);
    setEditName(product.name);
    setEditPricePerUnit(product.pricePerUnit);
    setEditCostPerUnit(product.costPerUnit);
    setEditModalVisible(true);
  };

  const handleEditProduct = () => {
    if (!editName || !editPricePerUnit || !editCostPerUnit) {
      Alert.alert('Error', 'Completa todos los campos');
      return;
    }
    if (
      isNaN(parseFloat(editPricePerUnit)) ||
      isNaN(parseFloat(editCostPerUnit))
    ) {
      Alert.alert('Error', 'Solo se permiten números en los precios');
      return;
    }

    updateProduct({
      ...editProduct,
      name: editName.trim(),
      pricePerUnit: editPricePerUnit,
      costPerUnit: editCostPerUnit,
    });
    setEditModalVisible(false);
    Alert.alert('Producto editado correctamente');
  };

  const formatCurrency = (amount: number) => {
    if (isNaN(amount)) return '$0.00';
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

      {/* Filtro de productos */}
      <View style={styles.filterBar}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'disponibles' && styles.filterButtonActive
          ]}
          onPress={() => setFilter('disponibles')}
        >
          <Text style={[
            styles.filterButtonText,
            filter === 'disponibles' && styles.filterButtonTextActive
          ]}>Disponibles</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'agotados' && styles.filterButtonActive
          ]}
          onPress={() => setFilter('agotados')}
        >
          <Text style={[
            styles.filterButtonText,
            filter === 'agotados' && styles.filterButtonTextActive
          ]}>Agotados</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'todos' && styles.filterButtonActive
          ]}
          onPress={() => setFilter('todos')}
        >
          <Text style={[
            styles.filterButtonText,
            filter === 'todos' && styles.filterButtonTextActive
          ]}>Todos</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {filteredProducts.length === 0 ? (
          <View style={styles.emptyState}>
            <Package color="#94a3b8" size={64} />
            <Text style={styles.emptyTitle}>No hay productos para mostrar</Text>
            <Text style={styles.emptyDescription}>
              Cambia el filtro o agrega productos nuevos
            </Text>
          </View>
        ) : (
          <View style={styles.productGrid}>
            {filteredProducts.map((product) => (
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
                    style={styles.addButton}
                    onPress={() => openAddStockModal(product)}
                  >
                    <Plus color="#22c55e" size={20} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => openEditProductModal(product)}
                  >
                    <Pencil color="#2563eb" size={20} />
                  </TouchableOpacity>
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
                    <Text style={styles.statValue}>{formatCurrency(parseFloat(product.pricePerUnit) || 0)}</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Scale color="#dc2626" size={16} />
                    <Text style={styles.statValue}>{parseFloat(product.availableQuantity) || 0}</Text>
                    <Text style={styles.statLabel}>disponible</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Truck color="#7c3aed" size={16} />
                    <Text style={styles.statValue}>{formatCurrency(parseFloat(product.investment) || 0)}</Text>
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
                        {
                          width: `${Math.min(
                            ((parseFloat(product.availableQuantity) || 0) /
                              (parseFloat(product.lotQuantity) || 1)) *
                            100,
                            100
                          )
                            }%`,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.progressText}>
                    {(parseFloat(product.availableQuantity) || 0)} / {(parseFloat(product.lotQuantity) || 0)}
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
              <Text style={styles.fieldLabel}>Nombre del producto *</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Ej: Arroz, Aceite, etc."
                placeholderTextColor="#94a3b8"
              />
              <Text style={styles.fieldLabel}>Precio de venta por unidad *</Text>
              <TextInput
                style={styles.input}
                value={pricePerUnit}
                onChangeText={text => {
                  if (/^\d*\.?\d*$/.test(text)) setPricePerUnit(text);
                }}
                placeholder="0.00"
                keyboardType="decimal-pad"
                placeholderTextColor="#94a3b8"
              />
              <Text style={styles.fieldLabel}>Unidad de medida *</Text>
              <TouchableOpacity
                style={styles.unitSelector}
                onPress={() => setUnitModalVisible(true)}
              >
                <Text style={styles.unitSelectorText}>
                  {getUnitLabel(unit)}
                </Text>
              </TouchableOpacity>
              <Text style={styles.fieldLabel}>Cantidad estándar (opcional)</Text>
              <TextInput
                style={styles.input}
                value={standardQuantity}
                onChangeText={text => {
                  if (/^\d*\.?\d*$/.test(text)) setStandardQuantity(text);
                }}
                placeholder="Cantidad típica de venta"
                keyboardType="decimal-pad"
                placeholderTextColor="#94a3b8"
              />
              <Text style={styles.fieldLabel}>Cantidad del lote *</Text>
              <TextInput
                style={styles.input}
                value={lotQuantity}
                onChangeText={text => {
                  if (/^\d*\.?\d*$/.test(text)) setLotQuantity(text);
                }}
                placeholder="Cantidad total disponible"
                keyboardType="decimal-pad"
                placeholderTextColor="#94a3b8"
              />
              <Text style={styles.fieldLabel}>Inversión *</Text>
              <TextInput
                style={styles.input}
                value={investment}
                onChangeText={text => {
                  if (/^\d*\.?\d*$/.test(text)) setInvestment(text);
                }}
                placeholder="Costo total del lote"
                keyboardType="decimal-pad"
                placeholderTextColor="#94a3b8"
              />
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

      {/* Add Stock Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={addStockModalVisible}
        onRequestClose={() => setAddStockModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Agregar Stock</Text>
            <Text style={styles.fieldLabel}>Cantidad a adicionar *</Text>
            <TextInput
              style={styles.input}
              value={additionalQuantity}
              onChangeText={text => {
                if (/^\d*\.?\d*$/.test(text)) setAdditionalQuantity(text);
              }}
              placeholder="Cantidad"
              keyboardType="decimal-pad"
              placeholderTextColor="#94a3b8"
            />
            <TouchableOpacity
              style={{ marginVertical: 10 }}
              onPress={() => setUseCustomInvestment(!useCustomInvestment)}
            >
              <Text style={{ color: '#2563eb' }}>
                {useCustomInvestment ? 'Usar inversión automática' : '¿La inversión fue a un precio diferente?'}
              </Text>
            </TouchableOpacity>
            {useCustomInvestment && (
              <>
                <Text style={styles.fieldLabel}>Inversión total para esta cantidad *</Text>
                <TextInput
                  style={styles.input}
                  value={additionalInvestment}
                  onChangeText={text => {
                    if (/^\d*\.?\d*$/.test(text)) setAdditionalInvestment(text);
                  }}
                  placeholder="Inversión"
                  keyboardType="decimal-pad"
                  placeholderTextColor="#94a3b8"
                />
              </>
            )}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setAddStockModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleAddStockToProduct}
              >
                <LinearGradient
                  colors={['#22c55e', '#16a34a']}
                  style={styles.confirmButtonGradient}
                >
                  <Text style={styles.confirmButtonText}>Agregar</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Product Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Editar Producto</Text>
            <Text style={styles.fieldLabel}>Nombre</Text>
            <TextInput
              style={styles.input}
              value={editName}
              onChangeText={setEditName}
              placeholder="Nombre"
              placeholderTextColor="#94a3b8"
            />
            <Text style={styles.fieldLabel}>Precio de venta por unidad</Text>
            <TextInput
              style={styles.input}
              value={editPricePerUnit}
              onChangeText={text => {
                if (/^\d*\.?\d*$/.test(text)) setEditPricePerUnit(text);
              }}
              placeholder="Precio de venta"
              keyboardType="decimal-pad"
              placeholderTextColor="#94a3b8"
            />
            <Text style={styles.fieldLabel}>Precio de inversión por unidad</Text>
            <TextInput
              style={styles.input}
              value={editCostPerUnit}
              onChangeText={text => {
                if (/^\d*\.?\d*$/.test(text)) setEditCostPerUnit(text);
              }}
              placeholder="Precio de inversión"
              keyboardType="decimal-pad"
              placeholderTextColor="#94a3b8"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleEditProduct}
              >
                <LinearGradient
                  colors={['#2563eb', '#1d4ed8']}
                  style={styles.confirmButtonGradient}
                >
                  <Text style={styles.confirmButtonText}>Guardar</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
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

  filterBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: '#f1f5f9',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#e2e8f0',
  },
  filterButtonActive: {
    backgroundColor: '#3b82f6',
  },
  filterButtonText: {
    color: '#1e293b',
    fontFamily: 'Inter-SemiBold',
    fontSize: 15,
  },
  filterButtonTextActive: {
    color: '#fff',
  },
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
  addButton: {
    width: 40,
    height: 40,
    backgroundColor: '#dcfce7',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  editButton: {
    width: 40,
    height: 40,
    backgroundColor: '#e0e7ff',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
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
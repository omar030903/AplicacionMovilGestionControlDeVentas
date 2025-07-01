import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  FlatList,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Plus, ShoppingCart, DollarSign, Calendar, Package, Trash2 } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import { Sale } from '@/types';

const { width } = Dimensions.get('window');

export default function AccountsScreen() {
  const { products, sales, addSale, deleteSale } = useApp();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState('');
  const [useSpecialPrice, setUseSpecialPrice] = useState(false);
  const [specialPrice, setSpecialPrice] = useState('');
  const [productSearchVisible, setProductSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleNewSale = () => {
    if (!selectedProduct || !quantity) {
      Alert.alert('Error', 'Por favor completa todos los campos obligatorios');
      return;
    }

    const product = products.find(p => p.id === selectedProduct);
    if (!product) {
      Alert.alert('Error', 'Producto no encontrado');
      return;
    }

    const saleQuantity = parseFloat(quantity);
    if (saleQuantity > product.availableQuantity) {
      Alert.alert('Error', 'No hay suficiente cantidad disponible');
      return;
    }

    const unitPrice = useSpecialPrice && specialPrice 
      ? parseFloat(specialPrice) 
      : product.pricePerUnit;

    const totalPrice = unitPrice * saleQuantity;

    addSale({
      productId: product.id,
      productName: product.name,
      quantity: saleQuantity,
      unitPrice,
      specialPrice: useSpecialPrice ? unitPrice : undefined,
      totalPrice,
    });

    // Reset form
    setSelectedProduct('');
    setQuantity('');
    setUseSpecialPrice(false);
    setSpecialPrice('');
    setSearchQuery('');
    setModalVisible(false);

    Alert.alert('Éxito', 'Nueva venta añadida');
  };

  const handleDeleteSale = (sale: Sale) => {
    Alert.alert(
      'Eliminar Venta',
      `¿Estás seguro de que quieres eliminar esta venta de "${sale.productName}"?\n\nEsta acción restaurará la cantidad del producto al inventario.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            deleteSale(sale.id);
            Alert.alert('Éxito', 'Venta eliminada correctamente');
          },
        },
      ]
    );
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderSaleRow = ({ item, index }: { item: Sale; index: number }) => (
    <View style={[styles.tableRow, index % 2 === 0 && styles.tableRowEven]}>
      <View style={styles.tableCell}>
        <Text style={styles.tableCellText} numberOfLines={2}>{item.productName}</Text>
        {item.specialPrice && (
          <View style={styles.specialPriceTag}>
            <Text style={styles.specialPriceText}>Precio Especial</Text>
          </View>
        )}
      </View>
      <View style={styles.tableCell}>
        <Text style={styles.tableCellText}>{item.quantity}</Text>
      </View>
      <View style={styles.tableCell}>
        <Text style={styles.tableCellText}>{formatCurrency(item.unitPrice)}</Text>
      </View>
      <View style={styles.tableCell}>
        <Text style={[styles.tableCellText, styles.totalPrice]}>{formatCurrency(item.totalPrice)}</Text>
      </View>
      <View style={styles.tableCell}>
        <Text style={[styles.tableCellText, styles.dateText]} numberOfLines={2}>
          {formatDate(item.date)}
        </Text>
      </View>
      <View style={styles.tableCellAction}>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteSale(item)}
        >
          <Trash2 color="#dc2626" size={16} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1e40af', '#3b82f6']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Cuentas</Text>
        <Text style={styles.headerSubtitle}>
          {sales.length} {sales.length === 1 ? 'venta registrada' : 'ventas registradas'}
        </Text>
      </LinearGradient>

      <View style={styles.content}>
        {sales.length === 0 ? (
          <View style={styles.emptyState}>
            <ShoppingCart color="#94a3b8" size={64} />
            <Text style={styles.emptyTitle}>No hay ventas registradas</Text>
            <Text style={styles.emptyDescription}>
              Comienza agregando tu primera venta
            </Text>
          </View>
        ) : (
          <View style={styles.tableContainer}>
            {/* Table Header */}
            <View style={styles.tableHeader}>
              <View style={styles.tableHeaderCell}>
                <Text style={styles.tableHeaderText}>Producto</Text>
              </View>
              <View style={styles.tableHeaderCell}>
                <Text style={styles.tableHeaderText}>Cant.</Text>
              </View>
              <View style={styles.tableHeaderCell}>
                <Text style={styles.tableHeaderText}>Precio/U</Text>
              </View>
              <View style={styles.tableHeaderCell}>
                <Text style={styles.tableHeaderText}>Total</Text>
              </View>
              <View style={styles.tableHeaderCell}>
                <Text style={styles.tableHeaderText}>Fecha</Text>
              </View>
              <View style={styles.tableHeaderCellAction}>
                <Text style={styles.tableHeaderText}>Acción</Text>
              </View>
            </View>

            {/* Table Body */}
            <FlatList
              data={sales.slice().reverse()}
              renderItem={renderSaleRow}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.tableBody}
            />
          </View>
        )}

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
      </View>

      {/* New Sale Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nueva Venta</Text>

            {/* Product Selection */}
            <Text style={styles.fieldLabel}>Producto *</Text>
            <TouchableOpacity
              style={styles.productSelector}
              onPress={() => setProductSearchVisible(true)}
            >
              <Text style={[
                styles.productSelectorText,
                !selectedProduct && styles.placeholderText
              ]}>
                {selectedProduct 
                  ? products.find(p => p.id === selectedProduct)?.name 
                  : 'Seleccionar producto'
                }
              </Text>
            </TouchableOpacity>

            {/* Quantity */}
            <Text style={styles.fieldLabel}>Cantidad *</Text>
            <TextInput
              style={styles.input}
              value={quantity}
              onChangeText={setQuantity}
              placeholder="Ingrese la cantidad"
              keyboardType="numeric"
              placeholderTextColor="#94a3b8"
            />

            {/* Special Price Toggle */}
            <TouchableOpacity
              style={styles.toggleContainer}
              onPress={() => setUseSpecialPrice(!useSpecialPrice)}
            >
              <View style={[
                styles.toggleButton,
                useSpecialPrice && styles.toggleButtonActive
              ]}>
                {useSpecialPrice && <View style={styles.toggleIndicator} />}
              </View>
              <Text style={styles.toggleLabel}>Precio especial</Text>
            </TouchableOpacity>

            {/* Special Price Input */}
            {useSpecialPrice && (
              <>
                <Text style={styles.fieldLabel}>Precio especial</Text>
                <TextInput
                  style={styles.input}
                  value={specialPrice}
                  onChangeText={setSpecialPrice}
                  placeholder="Ingrese el precio especial"
                  keyboardType="numeric"
                  placeholderTextColor="#94a3b8"
                />
              </>
            )}

            {/* Buttons */}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleNewSale}
              >
                <LinearGradient
                  colors={['#2563eb', '#1d4ed8']}
                  style={styles.confirmButtonGradient}
                >
                  <Text style={styles.confirmButtonText}>Listo</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Product Search Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={productSearchVisible}
        onRequestClose={() => setProductSearchVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.searchModalContent}>
            <Text style={styles.modalTitle}>Seleccionar Producto</Text>
            
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Buscar producto..."
              placeholderTextColor="#94a3b8"
              autoFocus
            />

            <FlatList
              data={filteredProducts}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.productItem}
                  onPress={() => {
                    setSelectedProduct(item.id);
                    setProductSearchVisible(false);
                    setSearchQuery('');
                  }}
                >
                  <Text style={styles.productItemName}>{item.name}</Text>
                  <Text style={styles.productItemDetails}>
                    {formatCurrency(item.pricePerUnit)} - Disponible: {item.availableQuantity}
                  </Text>
                </TouchableOpacity>
              )}
              style={styles.productList}
            />

            <TouchableOpacity
              style={styles.closeSearchButton}
              onPress={() => setProductSearchVisible(false)}
            >
              <Text style={styles.closeSearchButtonText}>Cerrar</Text>
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
    position: 'relative',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
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
  tableContainer: {
    flex: 1,
    margin: 20,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    shadowColor: '#1e40af',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    borderBottomWidth: 2,
    borderBottomColor: '#e2e8f0',
    paddingVertical: 12,
  },
  tableHeaderCell: {
    flex: 1,
    paddingHorizontal: 8,
    justifyContent: 'center',
  },
  tableHeaderCellAction: {
    width: 60,
    paddingHorizontal: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tableHeaderText: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    color: '#374151',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableBody: {
    paddingBottom: 100,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    minHeight: 60,
  },
  tableRowEven: {
    backgroundColor: '#f8fafc',
  },
  tableCell: {
    flex: 1,
    paddingHorizontal: 8,
    justifyContent: 'center',
    position: 'relative',
  },
  tableCellAction: {
    width: 60,
    paddingHorizontal: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tableCellText: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: '#1e293b',
    textAlign: 'center',
  },
  totalPrice: {
    fontFamily: 'Inter-SemiBold',
    color: '#059669',
  },
  dateText: {
    fontSize: 11,
    color: '#64748b',
  },
  specialPriceTag: {
    position: 'absolute',
    top: -4,
    right: 4,
    backgroundColor: '#fbbf24',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    zIndex: 1,
  },
  specialPriceText: {
    fontSize: 8,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
    textTransform: 'uppercase',
  },
  deleteButton: {
    width: 32,
    height: 32,
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
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
    maxHeight: '80%',
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
  productSelector: {
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f8fafc',
  },
  productSelectorText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1e293b',
  },
  placeholderText: {
    color: '#94a3b8',
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  toggleButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  toggleButtonActive: {
    borderColor: '#2563eb',
    backgroundColor: '#2563eb',
  },
  toggleIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#ffffff',
  },
  toggleLabel: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
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
  searchModalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    width: width - 40,
    maxHeight: '80%',
  },
  searchInput: {
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1e293b',
    backgroundColor: '#f8fafc',
    marginBottom: 16,
  },
  productList: {
    maxHeight: 300,
  },
  productItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  productItemName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1e293b',
    marginBottom: 4,
  },
  productItemDetails: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748b',
  },
  closeSearchButton: {
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
  },
  closeSearchButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#64748b',
    textAlign: 'center',
  },
});
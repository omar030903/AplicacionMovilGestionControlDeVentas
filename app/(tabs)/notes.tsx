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
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Plus, StickyNote, CreditCard as Edit3, Trash2, Calendar } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import { Note } from '@/types';

const { width } = Dimensions.get('window');

export default function NotesScreen() {
  const { notes, addNote, updateNote, deleteNote } = useApp();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const resetForm = () => {
    setTitle('');
    setContent('');
    setEditingNote(null);
  };

  const openEditModal = (note: Note) => {
    setEditingNote(note);
    setTitle(note.title);
    setContent(note.content);
    setModalVisible(true);
  };

  const handleSaveNote = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Por favor ingresa un título para la nota');
      return;
    }

    if (!content.trim()) {
      Alert.alert('Error', 'Por favor ingresa el contenido de la nota');
      return;
    }

    if (editingNote) {
      updateNote(editingNote.id, {
        title: title.trim(),
        content: content.trim(),
      });
      Alert.alert('Éxito', 'Nota actualizada correctamente');
    } else {
      addNote({
        title: title.trim(),
        content: content.trim(),
      });
      Alert.alert('Éxito', 'Nota añadida correctamente');
    }

    resetForm();
    setModalVisible(false);
  };

  const handleDeleteNote = (note: Note) => {
    Alert.alert(
      'Eliminar nota',
      `¿Estás seguro de que quieres eliminar "${note.title}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            deleteNote(note.id);
            Alert.alert('Éxito', 'Nota eliminada correctamente');
          },
        },
      ]
    );
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

  const truncateContent = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1e40af', '#3b82f6']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Notas</Text>
        <Text style={styles.headerSubtitle}>
          {notes.length} {notes.length === 1 ? 'nota guardada' : 'notas guardadas'}
        </Text>
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.addNoteHeader}>
          <Text style={styles.addNoteTitle}>Añade una nota</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => {
              resetForm();
              setModalVisible(true);
            }}
          >
            <LinearGradient
              colors={['#2563eb', '#1d4ed8']}
              style={styles.addButtonGradient}
            >
              <Plus color="#ffffff" size={20} />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={styles.notesList} 
          contentContainerStyle={styles.notesListContent}
          showsVerticalScrollIndicator={false}
        >
          {notes.length === 0 ? (
            <View style={styles.emptyState}>
              <StickyNote color="#94a3b8" size={64} />
              <Text style={styles.emptyTitle}>No tienes notas guardadas</Text>
              <Text style={styles.emptyDescription}>
                Toca el botón + para crear tu primera nota
              </Text>
            </View>
          ) : (
            <View style={styles.notesGrid}>
              {notes.slice().reverse().map((note) => (
                <View key={note.id} style={styles.noteCard}>
                  <View style={styles.noteHeader}>
                    <View style={styles.noteIcon}>
                      <StickyNote color="#3b82f6" size={20} />
                    </View>
                    <View style={styles.noteActions}>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => openEditModal(note)}
                      >
                        <Edit3 color="#64748b" size={16} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleDeleteNote(note)}
                      >
                        <Trash2 color="#dc2626" size={16} />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <Text style={styles.noteTitle}>{note.title}</Text>
                  <Text style={styles.noteContent}>
                    {truncateContent(note.content)}
                  </Text>

                  <View style={styles.noteFooter}>
                    <View style={styles.dateInfo}>
                      <Calendar color="#94a3b8" size={12} />
                      <Text style={styles.dateText}>
                        {formatDate(note.updatedAt)}
                      </Text>
                    </View>
                    
                    {note.createdAt.getTime() !== note.updatedAt.getTime() && (
                      <View style={styles.editedBadge}>
                        <Text style={styles.editedText}>Editada</Text>
                      </View>
                    )}
                  </View>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </View>

      {/* Add/Edit Note Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          resetForm();
          setModalVisible(false);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingNote ? 'Editar Nota' : 'Nueva Nota'}
            </Text>

            {/* Title Input */}
            <Text style={styles.fieldLabel}>Título *</Text>
            <TextInput
              style={styles.titleInput}
              value={title}
              onChangeText={setTitle}
              placeholder="Título de la nota"
              placeholderTextColor="#94a3b8"
              maxLength={50}
            />

            {/* Content Input */}
            <Text style={styles.fieldLabel}>Contenido *</Text>
            <TextInput
              style={styles.contentInput}
              value={content}
              onChangeText={setContent}
              placeholder="Escribe el contenido de tu nota aquí..."
              placeholderTextColor="#94a3b8"
              multiline
              textAlignVertical="top"
              maxLength={500}
            />

            <View style={styles.characterCount}>
              <Text style={styles.characterCountText}>
                {content.length}/500 caracteres
              </Text>
            </View>

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
                style={styles.saveButton}
                onPress={handleSaveNote}
              >
                <LinearGradient
                  colors={['#2563eb', '#1d4ed8']}
                  style={styles.saveButtonGradient}
                >
                  <Text style={styles.saveButtonText}>
                    {editingNote ? 'Actualizar' : 'Guardar'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
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
    padding: 20,
  },
  addNoteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  addNoteTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#1e293b',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    shadowColor: '#1e40af',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  addButtonGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notesList: {
    flex: 1,
  },
  notesListContent: {
    paddingBottom: 20,
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
  notesGrid: {
    gap: 16,
  },
  noteCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#1e40af',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  noteIcon: {
    width: 32,
    height: 32,
    backgroundColor: '#eff6ff',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noteActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#f8fafc',
  },
  noteTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  noteContent: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748b',
    lineHeight: 20,
    marginBottom: 12,
  },
  noteFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#94a3b8',
  },
  editedBadge: {
    backgroundColor: '#fbbf24',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  editedText: {
    fontSize: 10,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
    textTransform: 'uppercase',
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
  titleInput: {
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
  contentInput: {
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1e293b',
    backgroundColor: '#f8fafc',
    height: 120,
  },
  characterCount: {
    alignItems: 'flex-end',
    marginTop: 4,
  },
  characterCountText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#94a3b8',
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
  saveButton: {
    flex: 1,
    borderRadius: 12,
  },
  saveButtonGradient: {
    paddingVertical: 12,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
});
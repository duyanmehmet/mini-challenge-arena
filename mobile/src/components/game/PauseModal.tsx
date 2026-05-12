import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';

interface PauseModalProps {
  visible: boolean;
  onResume: () => void;
  onQuit: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({ visible, onResume, onQuit }) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>⏸ DURDURULDU</Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={[styles.button, styles.resumeButton]} onPress={onResume}>
              <Text style={styles.buttonText}>▶ DEVAM ET</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.quitButton]} onPress={onQuit}>
              <Text style={styles.buttonText}>🏠 ÇIKIŞ YAP</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#000000aa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: 280,
    backgroundColor: '#1a1a2e',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 40,
    letterSpacing: 2,
  },
  buttonContainer: {
    width: '80%',
    gap: 15,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 15,
    gap: 10,
  },
  resumeButton: {
    backgroundColor: '#4CAF50',
  },
  quitButton: {
    backgroundColor: '#F44336',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});

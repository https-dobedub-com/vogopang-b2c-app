import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { useAppMode } from '../../src/features/mode/context/AppModeProvider';

export default function GuardianUnlockScreen() {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const { requestGuardianAccess } = useAppMode();
  const router = useRouter();

  const handleSubmit = () => {
    const success = requestGuardianAccess(pin);

    if (!success) {
      setError('PIN이 올바르지 않습니다. 다시 확인해주세요.');
      return;
    }

    setError('');
    setPin('');
    router.replace('/guardian');
  };

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>보호자 인증</Text>
      <Text style={styles.text}>보호자 전용 화면에 들어가려면 PIN을 입력해주세요.</Text>

      <TextInput
        value={pin}
        onChangeText={setPin}
        placeholder="PIN 4자리"
        placeholderTextColor="#94A3B8"
        keyboardType="number-pad"
        secureTextEntry
        maxLength={8}
        style={styles.input}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Pressable style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitText}>인증하고 보호자 모드 진입</Text>
      </Pressable>

      <Text style={styles.hint}>현재 데모 PIN: 0420</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 20,
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
  },
  text: {
    fontSize: 14,
    lineHeight: 20,
    color: '#475569',
  },
  input: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#0F172A',
    letterSpacing: 2,
  },
  error: {
    color: '#B91C1C',
    fontSize: 13,
  },
  submitButton: {
    backgroundColor: '#111827',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  submitText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  hint: {
    marginTop: 4,
    color: '#64748B',
    fontSize: 12,
  },
});

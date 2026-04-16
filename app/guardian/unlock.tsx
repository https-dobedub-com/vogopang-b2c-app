import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { useAppMode } from '../../src/features/mode/context/AppModeProvider';

const PIN_LENGTH = 4;

export default function GuardianUnlockScreen() {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const { requestGuardianAccess } = useAppMode();
  const router = useRouter();
  const canSubmit = pin.length >= PIN_LENGTH;

  const handlePinChange = (nextPin: string) => {
    setPin(nextPin.replace(/[^0-9]/g, '').slice(0, PIN_LENGTH));
    setError('');
  };

  const handleSubmit = () => {
    if (!canSubmit) {
      setError('PIN 4자리를 입력해주세요.');
      return;
    }

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
      <View style={styles.panel}>
        <Text style={styles.title}>보호자 인증</Text>
        <Text style={styles.text}>보호자 전용 메뉴와 자료를 열려면 PIN을 입력해주세요.</Text>

        <View style={styles.pinDots}>
          {Array.from({ length: PIN_LENGTH }).map((_, index) => (
            <View key={index} style={[styles.pinDot, index < pin.length ? styles.pinDotActive : null]} />
          ))}
        </View>

        <TextInput
          value={pin}
          onChangeText={handlePinChange}
          placeholder="PIN 4자리"
          placeholderTextColor="#94A3B8"
          keyboardType="number-pad"
          secureTextEntry
          maxLength={PIN_LENGTH}
          style={styles.input}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable
          style={[styles.submitButton, !canSubmit ? styles.submitButtonDisabled : null]}
          onPress={handleSubmit}
          disabled={!canSubmit}
        >
          <Text style={[styles.submitText, !canSubmit ? styles.submitTextDisabled : null]}>보호자 모드 진입</Text>
        </Pressable>
      </View>

      <Text style={styles.hint}>데모 PIN: 0420</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: 20,
    justifyContent: 'center',
    gap: 12,
  },
  panel: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    padding: 18,
    gap: 14,
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
  pinDots: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginVertical: 4,
  },
  pinDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
  },
  pinDotActive: {
    borderColor: '#111827',
    backgroundColor: '#111827',
  },
  input: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#0F172A',
    letterSpacing: 2,
    textAlign: 'center',
  },
  error: {
    color: '#B91C1C',
    fontSize: 13,
  },
  submitButton: {
    backgroundColor: '#111827',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#E2E8F0',
  },
  submitText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  submitTextDisabled: {
    color: '#94A3B8',
  },
  hint: {
    color: '#64748B',
    fontSize: 12,
    textAlign: 'center',
  },
});

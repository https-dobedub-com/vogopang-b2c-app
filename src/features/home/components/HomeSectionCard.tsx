import { StyleSheet, Text, View } from 'react-native';

type HomeSectionCardProps = {
  title: string;
  description: string;
};

export function HomeSectionCard({ title, description }: HomeSectionCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardText}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 6,
  },
  cardText: {
    fontSize: 13,
    lineHeight: 18,
    color: '#64748B',
  },
});

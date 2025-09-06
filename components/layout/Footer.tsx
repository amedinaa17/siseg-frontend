import { Colors } from '@/theme/colors';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";

export default function Footer() {
  return (
    <SafeAreaView edges={["bottom"]} style={styles.safe}>
      <View style={styles.footer}>
        <Text style={styles.footerText}>Desarrollado por la Escuela Superior de Cómputo</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    backgroundColor: Colors.backgroundIPN,
    width: "100%",
  },
  footer: {
    backgroundColor: Colors.backgroundESCOM,
    padding: 10,
    alignItems: 'center',
  },
  footerText: { color: Colors.lightSecondary, fontWeight: '600', textAlign: 'center', },
});

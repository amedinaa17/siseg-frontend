import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";

export default function Footer() {
  return (
    <SafeAreaView edges={["bottom"]} style={styles.safe}>
      <View style={styles.footer}>
        <Text style={styles.footerText}>Desarrollado por la Escuela Superior de Cómputo - Instituto Politécnico Nacional</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    backgroundColor: "#682444",
  },
  footer: {
    backgroundColor: '#999999',
    padding: 10,
    alignItems: 'center',
  },
  footerText: { color: '#fff', fontWeight: '600', textAlign: 'center', },
});

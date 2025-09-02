import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";

type ButtonProps = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
};

export default function Button({ title, onPress, disabled }: ButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ hovered, pressed }) => [
        styles.base,
        hovered && styles.hover,
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      <Text style={styles.text}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: "#333333",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  hover: {
    backgroundColor: "#666666",
  },
  pressed: {
    backgroundColor: "#666666",
  },
  disabled: {
    opacity: 0.6,
  },
  text: {
    color: "white",
    fontWeight: "700",
    textAlign: "center",
  },
});

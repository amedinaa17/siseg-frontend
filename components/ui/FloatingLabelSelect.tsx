import { Colors } from '@/theme/colors';
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

type Item = { label: string; value: string };

type Props = {
  label: string;
  selectedValue?: string;
  onValueChange: (value: string) => void;
  items: Item[];
  error?: string;
};

export default function FloatingLabelSelect({
  label,
  selectedValue,
  onValueChange,
  items,
  error,
}: Props) {
  const [focused, setFocused] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const anim = useRef(new Animated.Value(selectedValue ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: focused || !!selectedValue ? 1 : 0,
      duration: 150,
      useNativeDriver: false,
    }).start();
  }, [focused, selectedValue]);

  const isError = !!error;

  const labelStyle = {
    position: "absolute" as const,
    left: 12,
    top: anim.interpolate({ inputRange: [0, 1], outputRange: [14, -8] }),
    fontSize: anim.interpolate({ inputRange: [0, 1], outputRange: [16, 12] }),
    color: isError ? Colors.error : focused ? Colors.link : Colors.lightText,
    backgroundColor: Colors.background,
    paddingHorizontal: 4,
  };

  return (
    <View>
      <Pressable
        onPress={() => setModalVisible(true)}
        style={[
          styles.wrapper,
          {
            borderColor: isError
              ? Colors.error
              : focused
              ? Colors.link
              : Colors.lightText,
          },
        ]}
      >
        <Animated.Text style={labelStyle}>{label}</Animated.Text>
        <Text
          style={[
            styles.valueText,
            { color: selectedValue ? Colors.secondary : Colors.lightText },
          ]}
        >
          {selectedValue || ""}
        </Text>
      </Pressable>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            {items.map((item) => (
              <Pressable
                key={item.value}
                onPress={() => {
                  onValueChange(item.value);
                  setModalVisible(false);
                  setFocused(true);
                }}
                style={styles.option}
              >
                <Text style={styles.optionText}>{item.label}</Text>
              </Pressable>
            ))}

            <Pressable
              onPress={() => setModalVisible(false)}
              style={[styles.option, styles.cancelOption]}
            >
              <Text style={styles.cancelText}>Cancelar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderWidth: 1,
    borderRadius: 8,
    borderColor: Colors.lightText,
    backgroundColor: Colors.background,
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
    height: 48,
    paddingHorizontal: 12,
  },
  valueText: {
    flex: 1,
    fontSize: 16,
    color: Colors.secondary,
  },
  errorText: {
    color: Colors.error,
    marginTop: 5,
    fontSize: 13,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalBox: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    width: "80%",
    maxWidth: 400,
    paddingVertical: 10,
    elevation: 4,
  },
  option: {
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  optionText: {
    fontSize: 16,
    color: Colors.secondary,
  },
  cancelOption: {
    borderTopWidth: 1,
    borderColor: "#ddd",
  },
  cancelText: {
    fontSize: 16,
    color: Colors.error,
    textAlign: "center",
  },
});

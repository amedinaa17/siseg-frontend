import { Colors } from '@/theme/colors';
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from "react-native";

type Props = TextInputProps & {
  label: string;
  error?: string;
};

export default function FloatingLabelInput({
  label,
  error,
  value,
  onFocus,
  onBlur,
  style,
  secureTextEntry,
  ...props
}: Props) {
  const [focused, setFocused] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const anim = React.useRef(new Animated.Value(value ? 1 : 0)).current;

  React.useEffect(() => {
    Animated.timing(anim, {
      toValue: focused || !!value ? 1 : 0,
      duration: 150,
      useNativeDriver: false,
    }).start();
  }, [focused, value]);

  const labelStyle = {
    position: "absolute" as const,
    left: 12,
    top: anim.interpolate({ inputRange: [0, 1], outputRange: [14, -8] }),
    fontSize: anim.interpolate({ inputRange: [0, 1], outputRange: [16, 12] }),
    color: error ? Colors.error : focused ? Colors.link : Colors.lightText,
    backgroundColor: Colors.background,
    paddingHorizontal: 4,
  };

  return (
    <View>
      <View
        style={[
          styles.wrapper,
          {
            borderColor: error
              ? Colors.error
              : focused
              ? Colors.link
              : Colors.lightText,
          },
        ]}
      >
        <Animated.Text style={labelStyle}>{label}</Animated.Text>
        <TextInput
          {...props}
          value={value}
          secureTextEntry={secureTextEntry && !showPassword}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          style={[
            styles.input,
            style,
            Platform.OS === "web"
              ? ({ outlineStyle: "none" } as any)
              : null,
          ]}
        />

        {secureTextEntry && (
          <Pressable
            onPress={() => setShowPassword((prev) => !prev)}
            style={styles.icon}
          >
            <Ionicons
              name={showPassword ? "eye-off" : "eye"}
              size={20}
              color="#6b7280"
            />
          </Pressable>
        )}
      </View>

      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
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
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 16,
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 6,
    color: Colors.secondary,
  },
  icon: {
    position: "absolute",
    right: 12,
    padding: 6,
  },
  errorText: {
    color: Colors.error,
    marginTop: 5,
    fontSize: 13,
  },
});

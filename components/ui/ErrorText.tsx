import React from 'react';
import { Text } from 'react-native';


export default function ErrorText({ children }: { children?: React.ReactNode }) {
if (!children) return null;
return <Text style={{ color: '#dc2626', marginTop: 3 }}>{children}</Text>;
}
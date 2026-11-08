import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useDebounce } from "../hooks/useDebounce";
import { CartItem } from "../types";
import { colors, formatPrice, radius } from "../theme";

interface Props {
  item: CartItem;
  onChangeQty: (bookId: number, quantity: number) => void;
  onRemove: (bookId: number) => void;
}

export function CartItemRow({ item, onChangeQty, onRemove }: Props) {
  const [qty, setQty] = useState(item.quantity);
  const debouncedQty = useDebounce(qty, 300);

  useEffect(() => {
    if (debouncedQty !== item.quantity) {
      onChangeQty(item.bookId, debouncedQty);
    }
  }, [debouncedQty]);

  useEffect(() => {
    setQty(item.quantity);
  }, [item.quantity]);

  const canDec = qty > 1;
  const canInc = qty < item.stock;

  return (
    <View style={styles.row}>
      <View style={[styles.cover, { backgroundColor: item.color }]}>
        <Text style={styles.emoji}>{item.emoji}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.price}>{formatPrice(item.price)}</Text>
        <View style={styles.qtyRow}>
          <Pressable
            disabled={!canDec}
            onPress={() => setQty((q) => q - 1)}
            hitSlop={6}
            accessibilityLabel="Giảm"
            style={[styles.btn, !canDec && styles.btnDisabled]}
          >
            <Text style={[styles.btnText, !canDec && styles.btnTextDisabled]}>−</Text>
          </Pressable>
          <Text style={styles.qtyText}>{qty}</Text>
          <Pressable
            disabled={!canInc}
            onPress={() => setQty((q) => q + 1)}
            hitSlop={6}
            accessibilityLabel="Tăng"
            style={[styles.btn, !canInc && styles.btnDisabled]}
          >
            <Text style={[styles.btnText, !canInc && styles.btnTextDisabled]}>+</Text>
          </Pressable>
          <Text style={styles.stock}>Còn {item.stock}</Text>
        </View>
      </View>
      <Pressable onPress={() => onRemove(item.bookId)} hitSlop={8} accessibilityLabel="Xóa khỏi giỏ">
        <Text style={styles.trash}>🗑️</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", backgroundColor: colors.card, borderRadius: radius.md, padding: 10, marginHorizontal: 12, marginVertical: 5, gap: 10 },
  cover: { width: 54, height: 72, borderRadius: radius.sm, alignItems: "center", justifyContent: "center" },
  emoji: { fontSize: 26 },
  info: { flex: 1, gap: 4 },
  title: { fontWeight: "700", color: colors.text },
  price: { color: colors.indigo, fontWeight: "800" },
  qtyRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 },
  btn: { width: 28, height: 28, borderRadius: 6, backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.line, alignItems: "center", justifyContent: "center" },
  btnDisabled: { opacity: 0.35 },
  btnText: { fontSize: 16, fontWeight: "700", color: colors.text, lineHeight: 18 },
  btnTextDisabled: { color: colors.muted },
  qtyText: { fontSize: 15, fontWeight: "700", color: colors.navy, minWidth: 20, textAlign: "center" },
  stock: { fontSize: 12, color: colors.muted, marginLeft: 4 },
  trash: { fontSize: 22 },
});

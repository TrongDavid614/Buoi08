import React, { useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Header } from "../components/Header";
import { CartItemRow } from "../components/CartItemRow";
import { PrimaryButton } from "../components/PrimaryButton";
import { EmptyState } from "../components/EmptyState";
import { useAuth, useCart } from "../store/hooks";
import { confirmDialog } from "../utils/dialog"; // đã viết sẵn — dùng ở BT8.7a
import { TabScreenProps } from "../navigation/types";
import { colors, formatPrice } from "../theme";

const COUPONS: Record<string, { label: string; discount: (subtotal: number) => number }> = {
  SALE10: { label: "Giảm 10%", discount: (s) => Math.round(s * 0.1) },
  GIAM50K: { label: "Giảm 50.000đ", discount: (s) => Math.min(50000, s) },
};

export function CartScreen({ navigation }: TabScreenProps<"Cart">) {
  const { items, totalPrice, setQty, remove } = useCart();
  const { isLoggedIn } = useAuth();

  const [couponInput, setCouponInput] = useState("");
  const [coupon, setCoupon] = useState<string | null>(null);
  const [couponMsg, setCouponMsg] = useState<string | null>(null);

  const discount = coupon ? COUPONS[coupon].discount(totalPrice) : 0;
  const finalTotal = Math.max(0, totalPrice - discount);

  const applyCoupon = () => {
    const code = couponInput.trim().toUpperCase();
    if (COUPONS[code]) {
      setCoupon(code);
      setCouponMsg(`Đã áp dụng ${code}: ${COUPONS[code].label}`);
    } else {
      setCoupon(null);
      setCouponMsg("Mã giảm giá không hợp lệ");
    }
  };

  const askRemove = (bookId: number) => {
    const item = items.find((i) => i.bookId === bookId);
    confirmDialog("Xóa sản phẩm", `Xóa "${item?.title ?? "sản phẩm"}" khỏi giỏ hàng?`, () => remove(bookId));
  };

  const goCheckout = () => {
    if (isLoggedIn) {
      navigation.navigate("Checkout", { total: finalTotal });
    } else {
      navigation.navigate("Login", { redirectTo: "Checkout", total: finalTotal });
    }
  };

  return (
    <View style={styles.container}>
      <Header title="🛒 Giỏ hàng" />
      <FlatList
        data={items}
        keyExtractor={(i) => String(i.bookId)}
        renderItem={({ item }) => <CartItemRow item={item} onChangeQty={setQty} onRemove={askRemove} />}
        contentContainerStyle={{ paddingVertical: 8, flexGrow: 1 }}
        ListEmptyComponent={
          <EmptyState emoji="🛒" title="Giỏ hàng trống" message="Hãy chọn vài cuốn sách yêu thích nhé." actionLabel="Khám phá sách" onAction={() => navigation.navigate("Home")} />
        }
      />
      {items.length > 0 && (
        <View style={styles.footer}>
          <View style={styles.couponRow}>
            <TextInput
              style={styles.couponInput}
              placeholder="Mã giảm giá (SALE10, GIAM50K)"
              placeholderTextColor={colors.muted}
              value={couponInput}
              onChangeText={setCouponInput}
              autoCapitalize="characters"
            />
            <Pressable style={styles.couponBtn} onPress={applyCoupon}>
              <Text style={styles.couponBtnText}>Áp dụng</Text>
            </Pressable>
          </View>
          {couponMsg ? (
            <Text style={coupon ? styles.couponSuccess : styles.couponError}>{couponMsg}</Text>
          ) : null}
          <View style={styles.line}><Text style={styles.muted}>Tạm tính</Text><Text style={styles.value}>{formatPrice(totalPrice)}</Text></View>
          {discount > 0 && (
            <View style={styles.line}>
              <Text style={styles.discountLabel}>Giảm giá ({coupon})</Text>
              <Text style={styles.discountValue}>-{formatPrice(discount)}</Text>
            </View>
          )}
          <View style={styles.line}><Text style={styles.total}>Tổng cộng</Text><Text style={styles.total}>{formatPrice(finalTotal)}</Text></View>
          <PrimaryButton title="Thanh toán" onPress={goCheckout} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  footer: { backgroundColor: "#fff", padding: 14, gap: 8, borderTopWidth: 1, borderTopColor: colors.line },
  couponRow: { flexDirection: "row", gap: 8 },
  couponInput: { flex: 1, backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.line, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, fontSize: 13, color: colors.text },
  couponBtn: { backgroundColor: colors.navy, paddingHorizontal: 14, justifyContent: "center", borderRadius: 8 },
  couponBtnText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  couponSuccess: { color: "#10B981", fontSize: 12, fontWeight: "600" },
  couponError: { color: colors.danger, fontSize: 12 },
  discountLabel: { color: "#10B981", fontWeight: "600" },
  discountValue: { color: "#10B981", fontWeight: "700" },
  line: { flexDirection: "row", justifyContent: "space-between" },
  muted: { color: colors.muted },
  value: { fontWeight: "700", color: colors.text },
  total: { fontSize: 17, fontWeight: "800", color: colors.navy },
});

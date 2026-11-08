# BÁO CÁO CÂU HỎI BỔ SUNG — BUỔI 8

### Câu 1: Cờ `ready` trong `useAutoPersist`
**Câu hỏi:** Trong `useAutoPersist`, nếu bỏ điều kiện `ready` thì chuyện gì xảy ra với giỏ hàng đã lưu khi bạn mở lại app? Giải thích theo thứ tự các lần render.

**Trả lời:**
- **Lần render đầu tiên (Initial render):** Khi app vừa mở lên, Redux store khởi tạo `cart.items` là một mảng rỗng `[]`. Lúc này, hàm bất đồng bộ đọc dữ liệu từ `AsyncStorage` (`loadJSON`) vẫn đang chạy và chưa trả về kết quả.
- **Nếu không có cờ `ready`:** `useAutoPersist` sẽ lập tức kích hoạt `useEffect` ngay sau lần render đầu tiên và ghi mảng rỗng `[]` đó vào `AsyncStorage`, đè lên giỏ hàng đã lưu từ phiên trước.
- **Khi hàm đọc AsyncStorage hoàn tất:** Lúc này dữ liệu đọc được đã bị ghi đè thành mảng rỗng, khiến giỏ hàng của người dùng bị mất trắng.
- **Vai trò của cờ `ready`:** Cờ `ready` bắt đầu bằng `false` và chỉ chuyển thành `true` sau khi `loadJSON` hoàn tất việc đọc và nạp (`hydrateCart`) vào store, nhờ đó ngăn chặn triệt để việc ghi đè dữ liệu rỗng lên bộ nhớ lưu trữ trước khi nạp xong.

---

### Câu 2: Token giả & Lưu trữ an toàn
**Câu hỏi:** Ở bài này app tự so mật khẩu và tự tạo token. Hãy nêu hai điểm không an toàn. Hệ thống thật thì ai kiểm tra mật khẩu, và token nên lưu ở đâu thay cho AsyncStorage?

**Trả lời:**
1. **Hai điểm không an toàn trong bài:**
   - Mật khẩu lưu dưới dạng plain-text (chưa băm/hash) trong `db.json` và client (app) phải tải toàn bộ thông tin người dùng về để tự so sánh mật khẩu, khiến bất kỳ ai cũng có thể đọc trộm danh sách tài khoản và mật khẩu.
   - Token chỉ là chuỗi ngẫu nhiên do client tự sinh (`Date.now()` / chuỗi giả lập), không có chữ ký số (như JWT signature), không có cơ chế xác thực từ server nên kẻ tấn công có thể dễ dàng giả mạo bất kỳ danh tính nào.
2. **Trong hệ thống thật:**
   - **Xác thực mật khẩu:** Phải được thực hiện hoàn toàn ở **phía Server**. Server nhận mật khẩu qua kênh truyền mã hóa (HTTPS), so khớp với hash mật khẩu (bằng bcrypt, argon2...) và cấp JWT token có chữ ký bảo mật kèm thời hạn hết hạn (`exp`).
   - **Lưu trữ token:** Thay vì dùng `AsyncStorage` (vốn lưu text thô không mã hóa), token nên được lưu trong kho lưu trữ an toàn phần cứng của hệ điều hành như **Expo SecureStore** (sử dụng Keychain trên iOS và KeyStore / EncryptedSharedPreferences trên Android).

---

### Câu 3: Hai effect trong `CartItemRow`
**Câu hỏi:** Thử xóa effect đồng bộ `setQty(item.quantity)`. Với thao tác nào thì số hiển thị trên nút bị lệch so với store?

**Trả lời:**
- Khi xóa `useEffect(() => { setQty(item.quantity); }, [item.quantity])`, `CartItemRow` sẽ chỉ giữ giá trị state `qty` được gán lúc component mount ban đầu.
- **Các thao tác gây lệch số hiển thị:**
  1. **Khi nạp dữ liệu (hydrate) từ AsyncStorage:** App mở lên khởi tạo `item.quantity` ban đầu, sau khi đọc `AsyncStorage` xong store cập nhật số lượng mới nhưng component không đồng bộ lại, vẫn hiển thị số cũ.
  2. **Khi thêm tiếp sản phẩm từ trang Chi tiết (`BookDetailScreen`):** Người dùng đang có sản phẩm trong giỏ, ra màn hình chi tiết bấm "Thêm vào giỏ" (store tăng số lượng lên), khi quay lại giỏ thì `CartItemRow` (nếu chưa bị unmount hoàn toàn) vẫn giữ `qty` cũ.
  3. **Khi xóa sản phẩm rồi thêm lại:** Thao tác xóa và thêm lại sản phẩm cùng loại có thể khiến state cục bộ bị lệch nếu component được tái sử dụng hoặc cache.

---

### Câu 4: Một nguồn state (Single Source of Truth)
**Câu hỏi:** Nếu `HeartButton` giữ trạng thái bằng `useState` riêng ở mỗi nơi, tim ở lưới và ở trang chi tiết sẽ khác nhau ra sao? Store giải quyết việc đó thế nào?

**Trả lời:**
- **Nếu dùng `useState` riêng:** Mỗi instance của `HeartButton` (ở `BookCard` trong danh sách Home, ở `BookDetailScreen`, ở `WishlistScreen`) sẽ quản lý trạng thái độc lập. Khi bấm tim ở trang chủ, chỉ có nút tim tại thẻ đó đổi sang đỏ, còn khi bấm vào trang chi tiết cuốn sách thì tim ở đó vẫn là trắng (chưa yêu thích), tạo ra sự bất nhất giao diện nghiêm trọng.
- **Giải pháp của Redux Store:** Redux đóng vai trò là "Single Source of Truth" (nguồn chân lý duy nhất). Toàn bộ danh sách id sách yêu thích (`ids`) được quản lý tập trung trong `wishlistSlice`. Mọi component `HeartButton` đều dùng chung hook `useWishlist()`, cùng đọc và cùng dispatch action `toggle(bookId)` lên store chung. Nhờ vậy, bất kỳ khi nào trạng thái yêu thích của cuốn sách thay đổi, tất cả component liên quan trên màn hình đều tự động re-render và đồng bộ trạng thái ngay lập tức.

---

### Câu 5: Code bổ sung — Ẩn/Hiện mật khẩu ở màn Đăng nhập
**Đã cài đặt:**
1. Thêm thuộc tính `rightAccessory` vào component `FormField.tsx`.
2. Khai báo state `showPassword` trong `LoginScreen.tsx`:
   ```tsx
   const [showPassword, setShowPassword] = useState(false);
   ```
3. Truyền thuộc tính `secureTextEntry={!showPassword}` cho ô Mật khẩu kèm nút bấm chuyển đổi icon:
   ```tsx
   <FormField
     label="Mật khẩu"
     value={password}
     onChangeText={setPassword}
     error={errors.password}
     secureTextEntry={!showPassword}
     rightAccessory={
       <Pressable
         onPress={() => setShowPassword((v) => !v)}
         hitSlop={8}
         accessibilityLabel={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
       >
         <Text style={{ fontSize: 18 }}>{showPassword ? "🙈" : "👁️"}</Text>
       </Pressable>
     }
   />
   ```
- Khi bấm vào biểu tượng 👁️, `showPassword` đổi thành `true`, mật khẩu hiển thị rõ và icon chuyển thành 🙈. Bấm lại thì mật khẩu lại được che bằng chấm đen bảo mật.

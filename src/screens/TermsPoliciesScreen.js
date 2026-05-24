import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const policySections = [
  {
    id: '1',
    title: '1. Giới thiệu về ứng dụng',
    content:
      'QR Campus là hệ thống quản lý giáo dục thông minh, hỗ trợ điểm danh sinh viên và chấm công giảng viên thông qua mã QR và nhận diện khuôn mặt (AI). Đây là sản phẩm thuộc khuôn khổ Đồ án tốt nghiệp của sinh viên khoa CNTT, trường Đại học Công nghiệp TP.HCM (IUH).',
  },
  {
    id: '2',
    title: '2. Quyền sở hữu trí tuệ',
    content:
      'Toàn bộ mã nguồn, thiết kế giao diện, logo và thuật toán (bao gồm cả mô hình tích hợp YOLOv8) thuộc quyền sở hữu của nhóm tác giả: Trần Minh Tiến và Phan Tiên Sinh.\n\nNghiêm cấm mọi hành vi sao chép, chỉnh sửa hoặc phân phối lại mã nguồn và tài liệu liên quan khi chưa có sự đồng ý bằng văn bản từ nhóm tác giả và Khoa CNTT - IUH.',
  },
  {
    id: '3',
    title: '3. Thu thập và Sử dụng dữ liệu',
    content:
      'Để phục vụ mục đích điểm danh và vận hành hệ thống, QR Campus sẽ thu thập các thông tin sau:\n\n• Thông tin định danh: Họ tên, Mã số sinh viên (MSSV)/Mã số giảng viên, Email sinh viên (IUH).\n• Dữ liệu hình ảnh: Hình ảnh chụp tại lớp học để phục vụ việc đối soát và nhận diện bằng AI.\n• Vị trí: Tọa độ GPS tại thời điểm điểm danh (để đảm bảo tính xác thực của việc có mặt tại trường).',
  },
  {
    id: '4',
    title: '4. Cam kết bảo mật',
    content:
      '• Dữ liệu của bạn chỉ được sử dụng cho mục đích học tập, quản lý nội bộ trong phạm vi đồ án và nhà trường.\n• Chúng tôi cam kết không chia sẻ dữ liệu cá nhân cho bên thứ ba vì mục đích thương mại.\n• Hệ thống sử dụng các phương thức xác thực hiện đại (JWT, Firebase) để bảo vệ quyền truy cập tài khoản.',
  },
  {
    id: '5',
    title: '5. Trách nhiệm của người dùng',
    content:
      '• Tính chính xác: Người dùng chịu trách nhiệm về tính chính xác của thông tin cung cấp.\n• Bảo mật tài khoản: Không chia sẻ tài khoản đăng nhập cho người khác.\n• Hành vi nghiêm cấm:\n  - Sử dụng các công cụ giả lập vị trí (Fake GPS) hoặc hình ảnh giả mạo để gian lận điểm danh.\n  - Tấn công, can thiệp trái phép vào hệ thống qua API hoặc cơ sở dữ liệu.',
  },
  {
    id: '6',
    title: '6. Giới hạn trách nhiệm',
    content:
      'Vì đây là sản phẩm đồ án tốt nghiệp đang trong quá trình hoàn thiện và thử nghiệm:\n\n• Nhóm tác giả không chịu trách nhiệm về các gián đoạn dịch vụ do lỗi đường truyền mạng hoặc bảo trì hệ thống.\n• Kết quả nhận diện từ mô hình AI có thể có sai số nhất định tùy thuộc vào điều kiện ánh sáng và góc chụp.',
  },
  {
    id: '7',
    title: '7. Thay đổi điều khoản',
    content:
      'Chúng tôi có quyền cập nhật các điều khoản này để phù hợp với yêu cầu thực tế của đồ án hoặc quy định của Nhà trường. Mọi thay đổi sẽ được thông báo trực tiếp trên ứng dụng.',
  },
];

const TermsPoliciesScreen = ({ navigation }) => {
  return (
    <SafeAreaView className="flex-1 bg-[#F4F6FA]">
      <StatusBar style="dark" />
      <ScrollView showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={['#2563eb', '#3b82f6']}
          style={{
            paddingTop: 24,
            paddingBottom: 86,
            paddingHorizontal: 24,
            overflow: 'hidden',
          }}
        >
          <View className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10" />
          <View className="absolute top-16 -left-10 w-28 h-28 rounded-full bg-white/10" />
          <View className="absolute bottom-6 right-12 w-16 h-16 rounded-full bg-white/10" />

          <View className="flex-row items-center justify-between">
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="w-10 h-10 rounded-full bg-white/20 items-center justify-center"
            >
              <Ionicons name="arrow-back" size={20} color="white" />
            </TouchableOpacity>
            <Text className="text-white text-xl font-bold">Điều khoản & Chính sách</Text>
            <View className="w-10 h-10" />
          </View>

          <Text className="text-white/85 text-sm mt-5 leading-5">
            Vui lòng đọc kỹ các điều khoản và chính sách trước khi sử dụng ứng dụng.
          </Text>
        </LinearGradient>

        <View className="px-6 -mt-14 pb-8">
          <View
            className="bg-white rounded-2xl p-6"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 6,
              elevation: 3,
            }}
          >
            {/* Header thông tin chính sách */}
            <View className="mb-6">
              <Text className="text-xl font-bold text-gray-900 text-justify">
                ĐIỀU KHOẢN VÀ CHÍNH SÁCH SỬ DỤNG ỨNG DỤNG QR CAMPUS
              </Text>
              <Text className="text-gray-600 mt-1">Ứng dụng QR Campus</Text>
              <View className="flex-row items-center mt-3">
                <Ionicons name="document-text-outline" size={18} color="#2563eb" />
                <Text className="text-gray-600 ml-2">
                  Phiên bản: <Text className="font-medium">1.0</Text>
                </Text>
              </View>
              <Text className="text-gray-600 mt-1">
                Ngày cập nhật: <Text className="font-medium">21/04/2026</Text>
              </Text>
              <Text className="text-gray-600 mt-1 text-sm text-justify">
                Đơn vị phát triển: Nhóm sinh viên Khoa CNTT - Trường Đại học Công nghiệp TP.HCM (IUH)
              </Text>
               <Text className="text-gray-600 mt-1 text-sm text-justify font-bold">
               Trần Minh Tiến - Phan Tiên Sinh
              </Text>
            </View>

            {/* Phần giới thiệu */}
            <View className="mb-6">
              <Text className="text-gray-700 leading-6 text-justify">
                Chào mừng bạn đến với QR Campus. Trước khi sử dụng ứng dụng, vui lòng đọc kỹ các điều khoản dưới đây. Việc bạn đăng nhập và sử dụng ứng dụng đồng nghĩa với việc bạn đồng ý tuân thủ các quy định này.
              </Text>
            </View>

            {/* Các điều khoản */}
            {policySections.map((section, index) => (
              <View
                key={section.id}
                className={`pb-5 ${index < policySections.length - 1 ? 'mb-5 border-b border-gray-100' : ''}`}
              >
                <Text className="text-gray-900 font-bold text-base mb-3">
                  {section.title}
                </Text>
                <Text className="text-gray-600 leading-6 whitespace-pre-line text-justify">
                  {section.content}
                </Text>
              </View>
            ))}

            {/* Phần liên hệ */}
            <View className="mt-6 pt-5 border-t border-gray-100">
              <Text className="text-gray-700 leading-6 text-justify">
                Thông tin liên hệ: Nếu có bất kỳ thắc mắc nào, vui lòng liên hệ với chúng tôi qua email sinh viên hoặc tại Văn phòng Khoa Công nghệ Thông tin - Trường Đại học Công nghiệp TP.HCM.
              </Text>
              <Text className="text-gray-700 mt-4 font-medium">
                Trân trọng,{'\n'}Nhóm phát triển QR Campus
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default TermsPoliciesScreen; 
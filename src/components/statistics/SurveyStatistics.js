import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const SurveyStatistics = ({ surveyStats }) => {
  if (!surveyStats || surveyStats.totalResponses === 0) {
    return null;
  }

  return (
    <View className="px-6 pb-6">
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-gray-900 font-bold text-lg">Kết quả khảo sát</Text>
        <View className="bg-blue-100 px-3 py-1 rounded-full">
          <Text className="text-blue-700 font-semibold text-xs">
            {surveyStats.totalResponses}/{surveyStats.totalStudents} phản hồi
          </Text>
        </View>
      </View>

      <View className="bg-white rounded-2xl p-4 mb-4" style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}>
        {/* Overall Score */}
        <View className="items-center pb-4 mb-4 border-b border-gray-100">
          <View className="w-32 h-32 rounded-full bg-gradient-to-br from-sky-50 to-blue-50 items-center justify-center mb-3"
            style={{
              borderWidth: 8,
              borderColor: '#3b82f6',
            }}
          >
            <Text className="text-4xl font-bold text-sky-600">
              {(surveyStats.questions.reduce((sum, q) => sum + q.averageRating, 0) / surveyStats.questions.length).toFixed(1)}
            </Text>
            <View className="flex-row items-center mt-1">
              <Ionicons name="star" size={16} color="#3b82f6" />
              <Text className="text-gray-500 text-xs ml-1">/ 5.0</Text>
            </View>
          </View>
          <Text className="text-gray-700 font-bold text-base">Điểm đánh giá trung bình</Text>
          <Text className="text-gray-500 text-xs mt-1">
            Từ {surveyStats.totalResponses} sinh viên
          </Text>
        </View>

        {/* Question Ratings */}
        {surveyStats.questions.map((q, index) => (
          <View 
            key={q.id} 
            className={`py-4 ${index < surveyStats.questions.length - 1 ? 'border-b border-gray-100' : ''}`}
          >
            <View className="flex-row items-start mb-3">
              <View className="w-6 h-6 bg-sky-100 rounded-full items-center justify-center mr-2 mt-0.5">
                <Text className="text-sky-600 font-bold text-xs">{index + 1}</Text>
              </View>
              <Text className="flex-1 text-gray-800 font-semibold text-sm leading-5">
                {q.question}
              </Text>
            </View>

            <View className="flex-row items-center mb-2">
              <View className="flex-row mr-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Ionicons
                    key={star}
                    name={star <= Math.round(q.averageRating) ? 'star' : 'star-outline'}
                    size={18}
                    color={star <= Math.round(q.averageRating) ? '#f59e0b' : '#d1d5db'}
                    style={{ marginRight: 2 }}
                  />
                ))}
              </View>
              <Text className="text-sky-600 font-bold text-lg">
                {q.averageRating.toFixed(1)}
              </Text>
              <Text className="text-gray-400 text-sm ml-1">/ 5.0</Text>
            </View>

            {/* Rating Distribution */}
            <View className="mt-2">
              
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = q.ratings[rating] || 0;
                const percentage = surveyStats.totalResponses > 0 ? (count / surveyStats.totalResponses * 100).toFixed(0) : 0;
                
                return (
                  <View key={rating} className="flex-row items-center mb-1.5">
                    <View className="flex-row items-center w-12">
                      <Text className="text-gray-600 text-xs mr-1">{rating}</Text>
                      <Ionicons name="star" size={12} color="#f59e0b" />
                    </View>
                    <View className="flex-1 h-2 bg-gray-100 rounded-full mx-2 overflow-hidden">
                      <View 
                        className={`h-full rounded-full ${
                          rating === 5 ? 'bg-green-500' :
                          rating === 4 ? 'bg-blue-500' :
                          rating === 3 ? 'bg-yellow-500' :
                          rating === 2 ? 'bg-orange-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </View>
                    <Text className="text-gray-500 text-xs w-12 text-right">
                      {count} ({percentage}%)
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        ))}
      </View>

      {/* Student Feedbacks */}
      {surveyStats.feedbacks && surveyStats.feedbacks.length > 0 && (
        <View className="bg-white rounded-2xl p-4" style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}>
          <View className="flex-row items-center mb-4">
            <View className="w-10 h-10 bg-blue-50 rounded-xl items-center justify-center mr-3">
              <Ionicons name="chatbubbles" size={20} color="#3b82f6" />
            </View>
            <View className="flex-1">
              <Text className="text-gray-900 font-bold text-base">Góp ý từ sinh viên</Text>
              <Text className="text-gray-500 text-xs">
                {surveyStats.feedbacks.length} phản hồi
              </Text>
            </View>
          </View>

          {surveyStats.feedbacks.map((feedback, index) => (
            <View 
              key={index}
              className={`py-3 ${index < surveyStats.feedbacks.length - 1 ? 'border-b border-gray-100' : ''}`}
            >
              <View className="flex-row items-start">
                <View className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center mr-3 mt-0.5">
                  <Ionicons name="person" size={16} color="#6b7280" />
                </View>
                <View className="flex-1">
                  <Text className="text-gray-700 text-sm leading-5">
                    "{feedback}"
                  </Text>
                  <Text className="text-gray-400 text-xs mt-1">
                    Sinh viên #{index + 1}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Participation Rate */}
      {surveyStats.totalResponses < surveyStats.totalStudents && (
        <View className="bg-yellow-50 rounded-xl p-4 mt-4 flex-row items-start border-l-4 border-yellow-500">
          <Ionicons name="information-circle" size={24} color="#f59e0b" />
          <View className="flex-1 ml-3">
            <Text className="text-yellow-900 font-bold mb-1">
              Tỷ lệ tham gia khảo sát
            </Text>
            <Text className="text-yellow-700 text-sm">
              {surveyStats.totalStudents - surveyStats.totalResponses} sinh viên chưa hoàn thành khảo sát. 
              Khuyến khích sinh viên tham gia đánh giá để cải thiện chất lượng giảng dạy.
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

export default SurveyStatistics;

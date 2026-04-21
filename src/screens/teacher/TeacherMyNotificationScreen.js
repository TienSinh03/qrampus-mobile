import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
	View,
	Text,
	TouchableOpacity,
	TextInput,
	FlatList,
	RefreshControl,
	ActivityIndicator,
	Alert,
	Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { instance } from '../../api/axiosInstance';
import { SvgUri } from 'react-native-svg';

const optimizeImageSvgUri = Image.resolveAssetSource(
	require('../../../assets/undraw_optimize-image_q59h.svg')
).uri;
const TARGET_MODE = {
	STUDENTS: 'students',
	SUBJECTS: 'subjects',
};

const normalizeText = (text = '') =>
	String(text)
		.toLowerCase()
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.trim();

const decodeHtmlEntities = (text = '') => {
	return text
		.replace(/&nbsp;/gi, ' ')
		.replace(/&amp;/gi, '&')
		.replace(/&lt;/gi, '<')
		.replace(/&gt;/gi, '>')
		.replace(/&quot;/gi, '"')
		.replace(/&#39;/gi, "'");
};

const htmlToReadableText = (html = '') => {
	if (!html || typeof html !== 'string') return '';

	return decodeHtmlEntities(
		html
			.replace(/<\s*br\s*\/?\s*>/gi, '\n')
			.replace(/<\s*\/\s*(p|div|li|h[1-6])\s*>/gi, '\n')
			.replace(/<\s*li\b[^>]*>/gi, '- ')
			.replace(/<[^>]*>/g, '')
			.replace(/\n{3,}/g, '\n\n')
			.trim()
	);
};

const getNotificationText = (notification = {}) => {
	const htmlMessage =
		notification?.message_html ||
		notification?.html ||
		notification?.content_html ||
		'';

	const plainMessage = notification?.message || '';
	const hasHtmlTags =
		typeof plainMessage === 'string' && /<\/?[a-z][\s\S]*>/i.test(plainMessage);

	const sourceHtml =
		(typeof htmlMessage === 'string' && htmlMessage.trim()) ||
		(hasHtmlTags ? plainMessage : '');

	return sourceHtml ? htmlToReadableText(sourceHtml) : plainMessage;
};

const getTimeLabel = (time) => {
	if (!time) return '--';
	const date = new Date(time);
	if (Number.isNaN(date.getTime())) return '--';
	return date.toLocaleString('vi-VN');
};

const extractSubjectLabels = (metadata = {}) => {
	if (Array.isArray(metadata?.subjects)) {
		return metadata.subjects
			.map((subject) => {
				if (!subject) return '';
				if (typeof subject === 'string') return subject;

				const modeText = subject?.modeLabel || subject?.mode || subject?.studyMode || '';
				const groupNumber = subject?.groupNumber || subject?.numberGroup || '';
				const groupText = groupNumber ? `Nhóm ${groupNumber}` : '';
				const main =
					subject?.courseCode ||
					subject?.code ||
					subject?.courseName ||
					subject?.name ||
					'';
				return [main, modeText, groupText].filter(Boolean).join(' - ');
			})
			.filter(Boolean);
	}

	if (Array.isArray(metadata?.subject_labels)) {
		return metadata.subject_labels.filter(Boolean);
	}

	if (metadata?.subject_label) {
		return [String(metadata.subject_label)];
	}

	return [];
};

const buildGroupedData = (notifications, studentByUserId) => {
	const groupedMap = new Map();

	notifications.forEach((item) => {
		const metadata = item?.metadata || {};
		const mode = metadata?.target_mode === TARGET_MODE.SUBJECTS ? TARGET_MODE.SUBJECTS : TARGET_MODE.STUDENTS;
		const message = getNotificationText(item);
		const sentAt = item?.sent_at || '';

		const recipientStudent = studentByUserId.get(String(item?.target_user_id || ''));
		const recipientLabel = recipientStudent
			? `${recipientStudent.studentCode || '--'} - ${recipientStudent.fullName || 'Không rõ tên'}`
			: '--';

		const subjectLabels = extractSubjectLabels(metadata);
		const groupKey = `${mode}|${item?.title || ''}|${sentAt}|${message}`;

		if (!groupedMap.has(groupKey)) {
			groupedMap.set(groupKey, {
				id: groupKey,
				mode,
				title: item?.title || 'Thông báo',
				message,
				sentAt,
				sentAtLabel: getTimeLabel(sentAt),
				recipients: new Set(),
				subjectLabels: new Set(),
			});
		}

		const group = groupedMap.get(groupKey);
		if (recipientLabel !== '--') {
			group.recipients.add(recipientLabel);
		}

		subjectLabels.forEach((label) => group.subjectLabels.add(label));
	});

	return Array.from(groupedMap.values()).map((group) => {
		const recipientList = Array.from(group.recipients);
		const subjects = Array.from(group.subjectLabels);
		const searchBlob =
			`${group.title} ${group.message} ${recipientList.join(' ')} ${subjects.join(' ')}`;

		return {
			...group,
			recipientList,
			subjects,
			recipientCount: recipientList.length,
			searchBlob,
		};
	});
};

const TeacherMyNotificationScreen = ({ navigation }) => {
	const [activeTab, setActiveTab] = useState(TARGET_MODE.SUBJECTS);
	const [searchKeyword, setSearchKeyword] = useState('');
	const [refreshing, setRefreshing] = useState(false);
	const [isLoading, setIsLoading] = useState(true);

	const [students, setStudents] = useState([]);
	const [createdNotifications, setCreatedNotifications] = useState([]);

	const studentByUserId = useMemo(() => {
		const map = new Map();
		students.forEach((student) => {
			const userId = student?.user?.userId;
			if (!userId) return;
			map.set(String(userId), student);
		});
		return map;
	}, [students]);

	const groupedNotifications = useMemo(
		() => buildGroupedData(createdNotifications, studentByUserId),
		[createdNotifications, studentByUserId]
	);

	const tabNotifications = useMemo(() => {
		const keyword = normalizeText(searchKeyword);

		return groupedNotifications
			.filter((item) => item.mode === activeTab)
			.filter((item) => {
				if (!keyword) return true;
				return normalizeText(item.searchBlob).includes(keyword);
			})
			.sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());
	}, [activeTab, groupedNotifications, searchKeyword]);

	const fetchAllMyCreatedNotifications = useCallback(async () => {
		const limit = 100;
		let offset = 0;
		let total = 0;
		let allNotifications = [];

		do {
			const res = await instance.get('/notifications/me/created', {
				params: { limit, offset },
			});

			const data = res?.data?.data || {};
			const pageNotifications = Array.isArray(data?.notifications) ? data.notifications : [];
			const pageTotal = Number(data?.pagination?.total);

			allNotifications = [...allNotifications, ...pageNotifications];
			total = Number.isFinite(pageTotal) ? pageTotal : allNotifications.length;
			offset += limit;

			if (pageNotifications.length === 0) break;
		} while (allNotifications.length < total);

		return allNotifications;
	}, []);

	const fetchData = useCallback(async () => {
		try {
			setIsLoading(true);

			const [studentsRes, notificationsRes] = await Promise.all([
				instance.get('/teachers/me/students'),
				fetchAllMyCreatedNotifications(),
			]);

			const studentsRaw = studentsRes?.data?.data?.students;
			const allNotifications = notificationsRes;

			const normalizedStudents = Array.isArray(studentsRaw) ? studentsRaw : [];
			const normalizedNotifications = Array.isArray(allNotifications) ? allNotifications : [];

			setStudents(normalizedStudents);
			setCreatedNotifications(normalizedNotifications);
		} catch {
			setStudents([]);
			setCreatedNotifications([]);
			Alert.alert('Lỗi', 'Không thể tải danh sách thông báo đã tạo.');
		} finally {
			setIsLoading(false);
		}
	}, [fetchAllMyCreatedNotifications]);

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	const onRefresh = useCallback(async () => {
		setRefreshing(true);
		await fetchData();
		setRefreshing(false);
	}, [fetchData]);

	const renderItem = ({ item }) => {
		const subjectContent =
			item.subjects.length > 0
				? item.subjects.slice(0, 3).join('\n')
				: 'Không có dữ liệu mã/tên/nhóm/hình thức học trong metadata.';

		const studentContent =
			item.recipientList.length > 0
				? item.recipientList.slice(0, 4).join('\n')
				: 'Không có dữ liệu mã/tên sinh viên.';

		return (
			<View
				className="bg-white rounded-2xl px-4 py-4 mb-3"
				style={{
					shadowColor: '#000',
					shadowOffset: { width: 0, height: 1 },
					shadowOpacity: 0.06,
					shadowRadius: 3,
					elevation: 2,
				}}
			>
				<Text className="text-gray-900 font-bold text-base">{item.title}</Text>
				<Text className="text-gray-500 text-xs mt-1">{item.sentAtLabel}</Text>

				<Text className="text-gray-700 text-sm leading-5 mt-3">{item.message || '--'}</Text>

				<View className="mt-3 rounded-xl bg-sky-50 px-3 py-3">
					<Text className="text-sky-700 text-xs font-semibold mb-1">
						{activeTab === TARGET_MODE.SUBJECTS
							? 'Học phần (mã, tên, nhóm, hình thức học)'
							: 'Sinh viên (mã, tên)'}
					</Text>
					<Text className="text-sky-900 text-sm leading-5">
						{activeTab === TARGET_MODE.SUBJECTS ? subjectContent : studentContent}
					</Text>
				</View>

			</View>
		);
	};

	return (
		<SafeAreaView className="flex-1 bg-[#F4F6FA]">
			<StatusBar style="light" />

			<LinearGradient
				colors={['#0369a1', '#38bdf8']}
				start={{ x: 0, y: 0 }}
				end={{ x: 1, y: 1 }}
				className="px-5 pt-4 pb-6"
			>
				<View
					pointerEvents="none"
					style={{
						position: 'absolute',
						right: 0,
						bottom: 0,
						width: 110,
						height: 160,
						opacity: 0.2,
					}}
				>
					<SvgUri
						uri={optimizeImageSvgUri}
						width="100%"
						height="100%"
						preserveAspectRatio="xMidYMid meet"
					/>
				</View>
				<View className="flex-row items-center justify-between mb-5">
					<TouchableOpacity
						onPress={() => navigation.goBack()}
						className="w-10 h-10 rounded-full items-center justify-center"
						style={{ backgroundColor: '#ffffff25' }}
					>
						<Ionicons name="arrow-back" size={22} color="white" />
					</TouchableOpacity>

					<Text className="text-white text-lg font-bold">Thông báo đã tạo</Text>
					<View className="w-10 h-10" />
				</View>

				<View className="bg-white/20 p-1 rounded-xl flex-row">
					<TabButton
						title="Học phần"
						isActive={activeTab === TARGET_MODE.SUBJECTS}
						onPress={() => setActiveTab(TARGET_MODE.SUBJECTS)}
					/>
					<TabButton
						title="Sinh viên"
						isActive={activeTab === TARGET_MODE.STUDENTS}
						onPress={() => setActiveTab(TARGET_MODE.STUDENTS)}
					/>
				</View>
			</LinearGradient>

			<View className="px-5 pt-4 pb-2">
				<View className="bg-white border border-gray-200 rounded-xl px-3 py-2.5 flex-row items-center">
					<Ionicons name="search" size={18} color="#64748b" />
					<TextInput
						value={searchKeyword}
						onChangeText={setSearchKeyword}
						placeholder={
							activeTab === TARGET_MODE.SUBJECTS
								? 'Tìm mã, tên, nhóm, hình thức học...'
								: 'Tìm mã, tên sinh viên...'
						}
						className="ml-2 flex-1 text-gray-800"
					/>
				</View>
			</View>

			{isLoading ? (
				<View className="flex-1 items-center justify-center">
					<ActivityIndicator size="large" color="#0284c7" />
					<Text className="text-gray-500 mt-3">Đang tải thông báo đã tạo...</Text>
				</View>
			) : (
				<FlatList
					data={tabNotifications}
					keyExtractor={(item) => item.id}
					renderItem={renderItem}
					contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24, paddingTop: 6 }}
					refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
					ListEmptyComponent={
						<View className="items-center justify-center py-16">
							<Ionicons name="notifications-off-outline" size={62} color="#cbd5e1" />
							<Text className="text-gray-500 text-center mt-3">
								Chưa có thông báo đã tạo phù hợp bộ lọc hiện tại.
							</Text>
						</View>
					}
				/>
			)}
		</SafeAreaView>
	);
};

const TabButton = ({ title, isActive, onPress }) => (
	<TouchableOpacity
		onPress={onPress}
		className="flex-1 rounded-lg px-2 py-2 items-center"
		style={{ backgroundColor: isActive ? '#ffffff' : 'transparent' }}
	>
		<Text
			className="font-semibold"
			style={{ color: isActive ? '#0369a1' : '#ffffff' }}
		>
			{title}
		</Text>
	</TouchableOpacity>
);

export default TeacherMyNotificationScreen;

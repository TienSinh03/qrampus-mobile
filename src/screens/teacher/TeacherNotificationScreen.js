import React, { useEffect, useMemo, useState } from 'react';
import {
	View,
	Text,
	ScrollView,
	TouchableOpacity,
	TextInput,
	Alert,
	Modal,
	ActivityIndicator,
	Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SvgUri } from 'react-native-svg';
import { useDispatch, useSelector } from 'react-redux';
import { instance } from '../../api/axiosInstance';
import { getTeacherProfileThunk } from '../../features/teacher/teacherThunks';
import { selectTeacherProfile } from '../../features/teacher/teacherSlice';
import { selectLoginRole, selectUser } from '../../features/auth/authSlice';

const normalizeText = (text = '') =>
	String(text)
		.toLowerCase()
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.trim();

const messageSentSvgUri = Image.resolveAssetSource(
	require('../../../assets/undraw_message-sent_iyz6.svg')
).uri;

const TeacherNotificationScreen = ({ navigation }) => {
	const dispatch = useDispatch();
	const profile = useSelector(selectTeacherProfile);
	const user = useSelector(selectUser);
	const loginRole = useSelector(selectLoginRole);

	const [activeTab, setActiveTab] = useState('students');
	const [modalVisible, setModalVisible] = useState(false);
	const [searchKeyword, setSearchKeyword] = useState('');
	const [isLoadingTargets, setIsLoadingTargets] = useState(false);
	const [isSending, setIsSending] = useState(false);

	const [teacherStudentPayload, setTeacherStudentPayload] = useState({
		teacher: null,
		totalClassSessions: 0,
		totalStudents: 0,
		students: [],
	});

	const [studentOptions, setStudentOptions] = useState([]);
	const [subjectOptions, setSubjectOptions] = useState([]);

	const [studentForm, setStudentForm] = useState({
		title: '',
		message: '',
	});

	const [courseForm, setCourseForm] = useState({
		title: '',
		message: '',
	});

	const [selectedStudents, setSelectedStudents] = useState([]);
	const [selectedCourses, setSelectedCourses] = useState([]);

	const currentForm = useMemo(
		() => (activeTab === 'students' ? studentForm : courseForm),
		[activeTab, studentForm, courseForm]
	);

	const updateForm = (key, value) => {
		if (activeTab === 'students') {
			setStudentForm((prev) => ({ ...prev, [key]: value }));
		} else {
			setCourseForm((prev) => ({ ...prev, [key]: value }));
		}
	};

	const senderDisplayName =
		profile?.full_name ||
		teacherStudentPayload?.teacher?.fullName ||
		user?.userName ||
		'--';

	const senderRoleLabel =
		loginRole === 'teacher'
			? 'Giảng viên'
			: loginRole === 'admin'
			? 'Quản trị viên'
			: 'Người gửi';

	useEffect(() => {
		if (!profile) {
			dispatch(getTeacherProfileThunk());
		}
	}, [profile, dispatch]);

	useEffect(() => {
		const fetchMyStudents = async () => {
			try {
				setIsLoadingTargets(true);
				const response = await instance.get('/teachers/me/students');
				const data = response?.data?.data || {};
				const students = Array.isArray(data?.students) ? data.students : [];

				setTeacherStudentPayload({
					teacher: data?.teacher || null,
					totalClassSessions: Number(data?.totalClassSessions) || 0,
					totalStudents: Number(data?.totalStudents) || students.length,
					students,
				});

				const mappedStudents = students.map((student) => ({
					id: String(student?.studentId),
					studentCode: student?.studentCode || '--',
					name: student?.fullName || 'Không rõ tên',
					userId: student?.user?.userId || null,
					label: student?.studentCode
						? `${student?.fullName || 'Không rõ tên'} - ${student.studentCode}`
						: student?.fullName || 'Không rõ tên',
				}));
				setStudentOptions(mappedStudents);

				const subjectMap = new Map();
				students.forEach((student) => {
					const enrollments = Array.isArray(student?.enrollments)
						? student.enrollments
						: [];

					enrollments.forEach((enrollment) => {
						const courseSection = enrollment?.courseSection;
						if (!courseSection?.id) return;

						const practiceGroup = enrollment?.practiceGroup || null;
						const subjectKey = `${courseSection.id}:${practiceGroup?.id || 'LT'}`;

						if (!subjectMap.has(subjectKey)) {
							const modeLabel = practiceGroup?.id
								? `Thực hành - Nhóm ${practiceGroup?.numberGroup ?? '?'}`
								: 'Lý thuyết';

							subjectMap.set(subjectKey, {
								id: subjectKey,
								courseSectionId: courseSection.id,
								practiceGroupId: practiceGroup?.id || null,
								courseCode: courseSection?.code || 'N/A',
								courseName: courseSection?.name || 'Không rõ tên',
								modeLabel,
								studentIds: new Set(),
							});
						}

						subjectMap.get(subjectKey).studentIds.add(String(student?.studentId));
					});
				});

				const mappedSubjects = Array.from(subjectMap.values()).map((item) => ({
					...item,
					studentIds: Array.from(item.studentIds),
					label: `${item.courseName} - ${item.courseCode} - ${item.modeLabel}`,
				}));

				setSubjectOptions(mappedSubjects);
			} catch (error) {
				setTeacherStudentPayload({
					teacher: null,
					totalClassSessions: 0,
					totalStudents: 0,
					students: [],
				});
				setStudentOptions([]);
				setSubjectOptions([]);
				Alert.alert('Lỗi', error?.response?.data?.message || 'Không thể tải danh sách sinh viên.');
			} finally {
				setIsLoadingTargets(false);
			}
		};

		fetchMyStudents();
	}, []);

	const filteredStudents = useMemo(() => {
		const keyword = normalizeText(searchKeyword);
		if (!keyword) return studentOptions;

		return studentOptions.filter((item) =>
			normalizeText(item?.label).includes(keyword)
		);
	}, [studentOptions, searchKeyword]);

	const filteredSubjects = useMemo(() => {
		const keyword = normalizeText(searchKeyword);
		if (!keyword) return subjectOptions;

		return subjectOptions.filter((item) =>
			normalizeText(item?.label).includes(keyword)
		);
	}, [subjectOptions, searchKeyword]);

	const toggleStudent = (id) => {
		setSelectedStudents((prev) =>
			prev.includes(id)
				? prev.filter((item) => item !== id)
				: [...prev, id]
		);
	};

	const toggleCourse = (id) => {
		setSelectedCourses((prev) =>
			prev.includes(id)
				? prev.filter((item) => item !== id)
				: [...prev, id]
		);
	};

	const resolveTargetStudentIds = () => {
		if (activeTab === 'students') {
			return [...new Set(selectedStudents)];
		}

		const selectedSubjectItems = subjectOptions.filter((item) =>
			selectedCourses.includes(item.id)
		);

		return [
			...new Set(
				selectedSubjectItems
					.flatMap((item) =>
						Array.isArray(item?.studentIds) ? item.studentIds : []
					)
					.filter(Boolean)
			),
		];
	};

	const sendNotificationsBySingleTarget = async (targetUserIds, payloadBase) => {
		const settledResults = await Promise.allSettled(
			targetUserIds.map((userId) =>
				instance.post('/notifications', {
					...payloadBase,
					target_user_id: userId,
				})
			)
		);

		const successCount = settledResults.filter((item) => item.status === 'fulfilled').length;
		return {
			successCount,
			failCount: settledResults.length - successCount,
		};
	};

	const handleSend = async () => {
		const hasTarget =
			activeTab === 'students'
				? selectedStudents.length > 0
				: selectedCourses.length > 0;

		if (
			!currentForm.title.trim() ||
			!currentForm.message.trim() ||
			!hasTarget
		) {
			Alert.alert(
				'Thiếu thông tin',
				'Vui lòng nhập tiêu đề, nội dung và chọn đối tượng nhận.'
			);
			return;
		}

		const targetStudentIds = resolveTargetStudentIds();
		if (!targetStudentIds.length) {
			Alert.alert('Thiếu đối tượng', 'Không tìm thấy sinh viên hợp lệ để gửi thông báo.');
			return;
		}

		const studentUserIdMap = new Map(
			(teacherStudentPayload.students || [])
				.filter((student) => student?.studentId && student?.user?.userId)
				.map((student) => [String(student.studentId), student.user.userId])
		);

		const targetUserIds = [
			...new Set(
				targetStudentIds
					.map((studentId) => studentUserIdMap.get(String(studentId)))
					.filter(Boolean)
			),
		];

		if (!targetUserIds.length) {
			Alert.alert('Lỗi', 'Không tìm thấy tài khoản người dùng hợp lệ để gửi thông báo.');
			return;
		}

		const normalizedTitle = currentForm.title.trim();
		const normalizedMessage = currentForm.message.trim();
		const metadata = {
			sender_name: senderDisplayName,
			sender_role: senderRoleLabel,
			sender_user_id: user?.userId || null,
			source: 'teacher_announcement_page',
			target_mode: activeTab === 'students' ? 'students' : 'subjects',
		};

		const payloadBase = {
			title: normalizedTitle,
			message: normalizedMessage,
			target_role: 'student',
			metadata,
		};

		try {
			setIsSending(true);

			try {
				const response = await instance.post('/notifications/bulk-target-type', {
					title: normalizedTitle,
					message: normalizedMessage,
					target_type: 'student',
					target_ids: targetUserIds,
					metadata,
				});

				const successCount = response?.data?.data?.summary?.recipient_count || targetUserIds.length;
				Alert.alert('Thành công', `Đã gửi thông báo cho ${successCount} sinh viên.`);
			} catch (bulkError) {
				const status = bulkError?.response?.status;
				if (status === 401 || status === 403) {
					const fallbackResult = await sendNotificationsBySingleTarget(targetUserIds, payloadBase);
					if (fallbackResult.successCount === 0) {
						throw new Error('Không thể gửi thông báo cho sinh viên.');
					}

					if (fallbackResult.failCount > 0) {
						Alert.alert(
							'Gửi một phần',
							`Đã gửi ${fallbackResult.successCount} sinh viên, ${fallbackResult.failCount} sinh viên gửi thất bại.`
						);
					} else {
						Alert.alert('Thành công', `Đã gửi thông báo cho ${fallbackResult.successCount} sinh viên.`);
					}
				} else {
					throw bulkError;
				}
			}

			setStudentForm({ title: '', message: '' });
			setCourseForm({ title: '', message: '' });
			setSelectedStudents([]);
			setSelectedCourses([]);
			setModalVisible(false);
			setSearchKeyword('');
		} catch (error) {
			Alert.alert('Lỗi', error?.response?.data?.message || error?.message || 'Không thể gửi thông báo.');
		} finally {
			setIsSending(false);
		}
	};

	return (
		<SafeAreaView className="flex-1 bg-[#F4F6FA]">
			<StatusBar style="light" />

			<LinearGradient
				colors={['#0284c7', '#38bdf8']}
				start={{ x: 0, y: 0 }}
				end={{ x: 1, y: 1 }}
				className="px-5 pt-4 pb-6 overflow-hidden"
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
						uri={messageSentSvgUri}
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
						<Ionicons
							name="arrow-back"
							size={22}
							color="white"
						/>
					</TouchableOpacity>

					<Text className="text-white text-lg font-bold">
						Quản lý thông báo
					</Text>

					<TouchableOpacity
						onPress={() => navigation.navigate('TeacherMyNotification')}
						className="w-10 h-10 rounded-full items-center justify-center"
						style={{ backgroundColor: '#ffffff25' }}
					>
						<Ionicons name="time-outline" size={20} color="white" />
					</TouchableOpacity>
				</View>

				<View className="bg-white/20 p-1 rounded-xl flex-row">
					<TabButton
						title="Sinh viên"
						isActive={activeTab === 'students'}
						onPress={() => setActiveTab('students')}
					/>

					<TabButton
						title="Học phần"
						isActive={activeTab === 'course'}
						onPress={() => setActiveTab('course')}
					/>
				</View>
			</LinearGradient>

			<ScrollView
				className="flex-1 px-5 pt-5"
				showsVerticalScrollIndicator={false}
			>
				<View className="bg-white rounded-2xl p-4 mb-4">
					<Text className="text-gray-900 text-base font-bold mb-1">
						Thông tin thông báo
					</Text>

					<Text className="text-gray-500 text-sm mb-4">
						Nhập nội dung và chọn đối tượng nhận.
					</Text>

					<FieldLabel text="Tiêu đề" />
					<TextInput
						value={currentForm.title}
						onChangeText={(text) =>
							updateForm('title', text)
						}
						placeholder="Nhập tiêu đề"
						className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-3"
					/>

					<FieldLabel text="Nội dung" />
					<TextInput
						value={currentForm.message}
						onChangeText={(text) =>
							updateForm('message', text)
						}
						placeholder="Nhập nội dung"
						multiline
						textAlignVertical="top"
						className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-3 min-h-[120px]"
					/>

					<FieldLabel
						text={
							activeTab === 'students'
								? 'Danh sách sinh viên'
								: 'Danh sách học phần'
						}
					/>

					<TouchableOpacity
						onPress={() => {
							setSearchKeyword('');
							setModalVisible(true);
						}}
						className="border border-gray-200 bg-gray-50 rounded-xl px-4 py-4 flex-row items-center justify-between"
					>
						<Text className="text-gray-700">
							{activeTab === 'students'
								? selectedStudents.length > 0
									? `Đã chọn ${selectedStudents.length} sinh viên`
									: 'Chọn sinh viên'
								: selectedCourses.length > 0
								? `Đã chọn ${selectedCourses.length} học phần`
								: 'Chọn học phần'}
						</Text>

						<Ionicons
							name="chevron-down"
							size={20}
							color="#6b7280"
						/>
					</TouchableOpacity>

					<Text className="text-xs text-gray-500 mt-2">
						Tổng buổi học: {teacherStudentPayload.totalClassSessions} | Tổng sinh viên: {teacherStudentPayload.totalStudents}
					</Text>
				</View>

				<TouchableOpacity
					onPress={handleSend}
					className="rounded-xl py-4 items-center mb-8"
					disabled={isSending || isLoadingTargets}
					style={{ backgroundColor: isSending || isLoadingTargets ? '#7dd3fc' : '#0284c7' }}
				>
					<Text className="text-white font-bold text-base">
						{isSending ? 'Đang gửi...' : 'Gửi thông báo'}
					</Text>
				</TouchableOpacity>
			</ScrollView>

			{/* MODAL */}
			<Modal
				visible={modalVisible}
				animationType="slide"
				transparent
			>
				<View className="flex-1 bg-black/40 justify-end">
					<View className="bg-white rounded-t-3xl p-5 max-h-[80%]">
						<View className="flex-row justify-between items-center mb-4">
							<Text className="text-lg font-bold">
								{activeTab === 'students'
									? 'Chọn sinh viên'
									: 'Chọn học phần'}
							</Text>

							<TouchableOpacity
								onPress={() =>
									setModalVisible(false)
								}
							>
								<Ionicons
									name="close"
									size={24}
									color="black"
								/>
							</TouchableOpacity>
						</View>

						<TextInput
							value={searchKeyword}
							onChangeText={setSearchKeyword}
							placeholder={activeTab === 'students' ? 'Tìm theo tên hoặc MSSV...' : 'Tìm theo mã hoặc tên học phần...'}
							className="border border-gray-200 bg-gray-50 rounded-xl px-3 py-3 mb-3"
						/>

						<ScrollView>
							{isLoadingTargets ? (
								<View className="py-8 items-center justify-center">
									<ActivityIndicator size="small" color="#0284c7" />
									<Text className="text-gray-500 mt-2">Đang tải dữ liệu...</Text>
								</View>
							) : activeTab === 'students' ? (
								filteredStudents.length > 0 ? (
									filteredStudents.map((item) => {
										const checked =
											selectedStudents.includes(
												item.id
											);

										return (
											<SelectItem
												key={item.id}
												title={item.label}
												checked={
													checked
												}
												onPress={() =>
													toggleStudent(
														item.id
													)
												}
											/>
										);
									})
								) : (
									<Text className="text-gray-500 text-center py-6">Không tìm thấy sinh viên phù hợp.</Text>
								)
							) : filteredSubjects.length > 0 ? (
								filteredSubjects.map((item) => {
										const checked =
											selectedCourses.includes(
												item.id
											);

										return (
											<SelectItem
												key={item.id}
												title={item.label}
												checked={
													checked
												}
												onPress={() =>
													toggleCourse(
														item.id
													)
												}
											/>
										);
								})
							) : (
								<Text className="text-gray-500 text-center py-6">Không tìm thấy học phần phù hợp.</Text>
							)}
						</ScrollView>

						<TouchableOpacity
							onPress={() =>
								setModalVisible(false)
							}
							className="mt-4 rounded-xl py-4 items-center"
							style={{
								backgroundColor: '#0284c7',
							}}
						>
							<Text className="text-white font-bold">
								Xác nhận
							</Text>
						</TouchableOpacity>
					</View>
				</View>
			</Modal>
		</SafeAreaView>
	);
};

const TabButton = ({ title, isActive, onPress }) => (
	<TouchableOpacity
		onPress={onPress}
		className="flex-1 rounded-lg px-2 py-2 items-center"
		style={{
			backgroundColor: isActive ? '#ffffff' : 'transparent',
		}}
	>
		<Text
			className="font-semibold"
			style={{
				color: isActive ? '#0284c7' : '#ffffff',
			}}
		>
			{title}
		</Text>
	</TouchableOpacity>
);

const FieldLabel = ({ text }) => (
	<Text className="text-gray-700 font-semibold mt-4 mb-2">
		{text}
	</Text>
);

const SelectItem = ({ title, checked, onPress }) => (
	<TouchableOpacity
		onPress={onPress}
		className="flex-row items-center justify-between border-b border-gray-100 py-4"
	>
		<Text className="text-gray-800 flex-1 pr-3">{title}</Text>

		<Ionicons
			name={checked ? 'checkbox' : 'square-outline'}
			size={24}
			color={checked ? '#0284c7' : '#9ca3af'}
		/>
	</TouchableOpacity>
);

export default TeacherNotificationScreen;
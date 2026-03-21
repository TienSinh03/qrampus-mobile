import { createSlice } from "@reduxjs/toolkit";
import {
    createAttendanceSessionThunk,
    getAttendanceHistoryThunk,
    closeAttendanceSessionThunk,
    getNextQRThunk,
    scanAttendanceByQRThunk,
    getAttendanceSessionStatsThunk,
} from "./attendanceSessionThunks";

const initialState = {
    // Active session
    activeSession: null,
    currentQR: null,
    classInfo: null,

    // History
    sessions: [],
    pagination: null,

    // Loading states
    createLoading: false,
    createError: null,
    historyLoading: false,
    historyError: null,
    closeLoading: false,
    closeError: null,
    nextQRLoading: false,
    nextQRError: null,

    // Student scan
    scanLoading: false,
    scanError: null,
    scanResult: null,

    // Session live stats for teacher
    sessionStatsLoading: false,
    sessionStatsError: null,
    sessionStats: null,
    // liveScanEvent: null,
};

const attendanceSessionSlice = createSlice({
    name: 'attendanceSession',
    initialState,
    reducers: {
        clearActiveSession: (state) => {
            state.activeSession = null;
            state.currentQR = null;
            state.classInfo = null;
            state.createError = null;
        },
        clearHistory: (state) => {
            state.sessions = [];
            state.pagination = null;
            state.historyError = null;
        },
        clearErrors: (state) => {
            state.createError = null;
            state.historyError = null;
            state.closeError = null;
            state.nextQRError = null;
            state.scanError = null;
            state.sessionStatsError = null;
        },
        updateCurrentQR: (state, action) => {
            state.currentQR = action.payload;
        },
        setActiveSession: (state, action) => {
            state.activeSession = action.payload;
        },
        pushLiveScanEvent: (state, action) => {
            state.liveScanEvent = {
                ...action.payload,
                receivedAt: Date.now(),
            };
        },
    },
    extraReducers: (builder) => {
        builder
            // Create attendance session
            .addCase(createAttendanceSessionThunk.pending, (state) => {
                state.createLoading = true;
                state.createError = null;
            })
            .addCase(createAttendanceSessionThunk.fulfilled, (state, action) => {
                state.createLoading = false;
                state.activeSession = action.payload.attendanceSession;
                state.currentQR = action.payload.firstQr;
                state.classInfo = action.payload.classInfo;
            })
            .addCase(createAttendanceSessionThunk.rejected, (state, action) => {
                state.createLoading = false;
                state.createError = action.payload;
            })

            // Get history
            .addCase(getAttendanceHistoryThunk.pending, (state) => {
                state.historyLoading = true;
                state.historyError = null;
            })
            .addCase(getAttendanceHistoryThunk.fulfilled, (state, action) => {
                state.historyLoading = false;
                state.sessions = action.payload.sessions || [];
                state.pagination = action.payload.pagination || null;
            })
            .addCase(getAttendanceHistoryThunk.rejected, (state, action) => {
                state.historyLoading = false;
                state.historyError = action.payload;
            })

            // Close session
            .addCase(closeAttendanceSessionThunk.pending, (state) => {
                state.closeLoading = true;
                state.closeError = null;
            })
            .addCase(closeAttendanceSessionThunk.fulfilled, (state, action) => {
                state.closeLoading = false;
                if (state.activeSession?.id === action.payload.id) {
                    state.activeSession = {
                        ...state.activeSession,
                        status: action.payload.status,
                    };
                }
                // Update in history list
                state.sessions = state.sessions.map(s =>
                    s.id === action.payload.id
                        ? { ...s, status: action.payload.status, quorum_met: action.payload.quorum_met }
                        : s
                );
            })
            .addCase(closeAttendanceSessionThunk.rejected, (state, action) => {
                state.closeLoading = false;
                state.closeError = action.payload;
            })

            // Next QR
            .addCase(getNextQRThunk.pending, (state) => {
                state.nextQRLoading = true;
                state.nextQRError = null;
            })
            .addCase(getNextQRThunk.fulfilled, (state, action) => {
                state.nextQRLoading = false;
                state.currentQR = action.payload;
            })
            .addCase(getNextQRThunk.rejected, (state, action) => {
                state.nextQRLoading = false;
                state.nextQRError = action.payload;
            })

            // Student scan QR
            .addCase(scanAttendanceByQRThunk.pending, (state) => {
                state.scanLoading = true;
                state.scanError = null;
            })
            .addCase(scanAttendanceByQRThunk.fulfilled, (state, action) => {
                state.scanLoading = false;
                state.scanResult = action.payload;
            })
            .addCase(scanAttendanceByQRThunk.rejected, (state, action) => {
                state.scanLoading = false;
                state.scanError = action.payload;
            })

            // Teacher session stats
            .addCase(getAttendanceSessionStatsThunk.pending, (state) => {
                state.sessionStatsLoading = true;
                state.sessionStatsError = null;
            })
            .addCase(getAttendanceSessionStatsThunk.fulfilled, (state, action) => {
                state.sessionStatsLoading = false;
                state.sessionStats = action.payload;
            })
            .addCase(getAttendanceSessionStatsThunk.rejected, (state, action) => {
                state.sessionStatsLoading = false;
                state.sessionStatsError = action.payload;
            });
    },
});

export const {
    clearActiveSession,
    clearHistory,
    clearErrors,
    updateCurrentQR,
    setActiveSession,
    pushLiveScanEvent,
} = attendanceSessionSlice.actions;

// Selectors
export const selectActiveSession = (state) => state.attendanceSession.activeSession;
export const selectCurrentQR = (state) => state.attendanceSession.currentQR;
export const selectClassInfo = (state) => state.attendanceSession.classInfo;
export const selectSessions = (state) => state.attendanceSession.sessions;
export const selectPagination = (state) => state.attendanceSession.pagination;
export const selectCreateLoading = (state) => state.attendanceSession.createLoading;
export const selectCreateError = (state) => state.attendanceSession.createError;
export const selectHistoryLoading = (state) => state.attendanceSession.historyLoading;
export const selectCloseLoading = (state) => state.attendanceSession.closeLoading;
export const selectNextQRLoading = (state) => state.attendanceSession.nextQRLoading;
export const selectScanLoading = (state) => state.attendanceSession.scanLoading;
export const selectScanError = (state) => state.attendanceSession.scanError;
export const selectSessionStats = (state) => state.attendanceSession.sessionStats;
export const selectLiveScanEvent = (state) => state.attendanceSession.liveScanEvent;

export default attendanceSessionSlice.reducer;

// @ts-nocheck
import dayjs from 'dayjs';
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { useQuery, useQueryClient } from 'react-query';

import { axiosInstance } from '../../../axiosInstance';
import { queryKeys } from '../../../react-query/constants';
import { useUser } from '../../user/hooks/useUser';
import { AppointmentDateMap } from '../types';
import { getAvailableAppointments } from '../utils';
import { getMonthYearDetails, getNewMonthYear, MonthYear } from './monthYear';

// for useQuery call
async function getAppointments(
  year: string,
  month: string,
): Promise<AppointmentDateMap> {
  const { data } = await axiosInstance.get(`/appointments/${year}/${month}`);
  return data;
}

// types for hook return object
interface UseAppointments {
  appointments: AppointmentDateMap;
  monthYear: MonthYear;
  updateMonthYear: (monthIncrement: number) => void;
  showAll: boolean;
  setShowAll: Dispatch<SetStateAction<boolean>>;
}

// The purpose of this hook:
//   1. track the current month/year (aka monthYear) selected by the user
//     1a. provide a way to update state
//   2. return the appointments for that particular monthYear
//     2a. return in AppointmentDateMap format (appointment arrays indexed by day of month)
//     2b. prefetch the appointments for adjacent monthYears
//   3. track the state of the filter (all appointments / available appointments)
//     3a. return the only the applicable appointments for the current monthYear
export function useAppointments(): UseAppointments {
  /** ****************** START 1: monthYear state *********************** */
  // get the monthYear for the current date (for default monthYear state)
  const currentMonthYear = getMonthYearDetails(dayjs());

  // state to track current monthYear chosen by user
  // state value is returned in hook return object
  const [monthYear, setMonthYear] = useState(currentMonthYear);

  // setter to update monthYear obj in state when user changes month in view,
  // returned in hook return object
  function updateMonthYear(monthIncrement: number): void {
    setMonthYear((prevData) => getNewMonthYear(prevData, monthIncrement));
  }
  /** ****************** END 1: monthYear state ************************* */
  /** ****************** START 2: filter appointments  ****************** */
  // State and functions for filtering appointments to show all or only available
  const [showAll, setShowAll] = useState(false);

  // We will need imported function getAvailableAppointments here
  // We need the user to pass to getAvailableAppointments so we can show
  //   appointments that the logged-in user has reserved (in white)
  const { user } = useUser();

  // 얘약 가능 일자만 확인할 수 있도록 select 옵션을 이용해 데이터 필터링
  // select는 pre-fetch 옵션이 아니어서 pre-fetch 데이터에는 추가 안됨
  const selectFn = useCallback((data) => getAvailableAppointments(data, user), [
    user,
  ]);

  /** ****************** END 2: filter appointments  ******************** */
  /** ****************** START 3: useQuery  ***************************** */
  // useQuery call for appointments for the current monthYear

  const commonOptions = {
    // staleTime 과 cacheTime 은 프리페칭에 적용되므로 공통으로 사용하기 위해 따로 분리
    staleTime: 0, // 즉시 리페칭
    cacheTime: 300000, // 기본 값 5분
  };

  // pre-fetch
  const queryClient = useQueryClient();
  useEffect(() => {
    // monthYear 업데이트 될 때마다(버튼 클릭) month 증가
    const nextMonthYear = getNewMonthYear(monthYear, 1);
    // 다음 달 데이터를 캐시 데이터로 저장해 프리페칭
    queryClient.prefetchQuery(
      [queryKeys.appointments, monthYear.year, monthYear.month],
      () => getAppointments(nextMonthYear.year, nextMonthYear.month),
      commonOptions,
    );
  }, [queryClient, monthYear, commonOptions]);

  // TODO: update with useQuery!
  // Notes:
  //    1. appointments is an AppointmentDateMap (object with days of month
  //       as properties, and arrays of appointments for that day as values)
  //
  //    2. The getAppointments query function needs monthYear.year and
  //       monthYear.month
  const fallback = {};

  const { data: appointments = fallback } = useQuery(
    // 쿼리 키를 의존성 배열로 취급해 새로운 쿼리를 생성하고 새 데이터를 가져올 수 있게 처리
    [queryKeys.appointments, monthYear.year, monthYear.month],
    () => getAppointments(monthYear.year, monthYear.month),
    {
      select: showAll ? undefined : selectFn,
      // 예약 데이터는 실시간으로 변동됨으로 re-fetch 옵션 따로 설정
      ...commonOptions,
      refetchOnMount: true,
      refetchOnReconnect: true,
      refetchOnWindowFocus: true,
    },
  );

  /** ****************** END 3: useQuery  ******************************* */

  return { appointments, monthYear, updateMonthYear, showAll, setShowAll };
}

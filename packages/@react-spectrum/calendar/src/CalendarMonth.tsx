/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {CalendarCell} from './CalendarCell';
import {CalendarDate, endOfMonth, getWeeksInMonth, startOfWeek} from '@internationalized/date';
import {CalendarPropsBase} from '@react-types/calendar';
import {CalendarState, RangeCalendarState} from '@react-stately/calendar';
import {classNames} from '@react-spectrum/utils';
import {DOMProps, StyleProps} from '@react-types/shared';
import React, {useEffect, useState} from 'react';
import styles from '@adobe/spectrum-css-temp/components/calendar/vars.css';
import {useCalendarGrid} from '@react-aria/calendar';
import {useLocale} from '@react-aria/i18n';
import {useProviderProps} from '@react-spectrum/provider';

interface CalendarMonthProps extends CalendarPropsBase, DOMProps, StyleProps {
  state: CalendarState | RangeCalendarState,
  startDate: CalendarDate
}

export function CalendarMonth(props: CalendarMonthProps) {
  props = useProviderProps(props);
  let {
    state,
    startDate
  } = props;
  let {
    gridProps,
    weekDays
  } = useCalendarGrid({
    ...props,
    endDate: endOfMonth(startDate)
  }, state);

  let {locale} = useLocale();
  let monthStart = startOfWeek(startDate, locale);
  let weeksInMonth = getWeeksInMonth(startDate, locale);

  let [isRangeSelecting, setRangeSelecting] = useState(false);
  let hasAnchorDate = 'anchorDate' in state && state.anchorDate != null;

  // Update isRangeSelecting immediately when it becomes true.
  // This feels weird but is actually fine...
  // https://reactjs.org/docs/hooks-faq.html#how-do-i-implement-getderivedstatefromprops
  if (hasAnchorDate && !isRangeSelecting) {
    setRangeSelecting(true);
  }

  // Delay removing the is-range-selecting class for a frame after selection ends.
  // This avoids an undesired animation on touch devices.
  useEffect(() => {
    if (!hasAnchorDate && isRangeSelecting) {
      let raf = requestAnimationFrame(() => setRangeSelecting(false));
      return () => cancelAnimationFrame(raf);
    }
  }, [hasAnchorDate, isRangeSelecting]);

  return (
    <table
      {...gridProps}
      className={classNames(styles, 'spectrum-Calendar-body', 'spectrum-Calendar-table', {'is-range-selecting': isRangeSelecting})}>
      {/* Column headers are hidden to screen readers to make navigating with a touch screen reader easier.
        * The day names are already included in the label of each cell, so there's no need to announce them twice. */}
      <thead aria-hidden="true">
        <tr>
          {weekDays.map((day, index) => (
            <th
              key={index}
              className={classNames(styles, 'spectrum-Calendar-tableCell')}>
              <span className={classNames(styles, 'spectrum-Calendar-dayOfWeek')}>
                {day.narrow}
              </span>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {[...new Array(weeksInMonth).keys()].map(weekIndex => (
          <tr key={weekIndex}>
            {[...new Array(7).keys()].map(dayIndex => (
              <CalendarCell
                key={dayIndex}
                state={state}
                date={monthStart.add({weeks: weekIndex, days: dayIndex})}
                currentMonth={startDate} />
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

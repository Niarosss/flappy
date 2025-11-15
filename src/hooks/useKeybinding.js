import { useEffect, useRef } from "react";

/**
 * Кастомний хук для прив'язки обробників до подій клавіатури.
 * @param {string | string[]} key - Клавіша або масив клавіш для відстеження (напр., 'Enter', [' ', 'w']).
 * @param {function} callback - Функція, що викликається при натисканні клавіші.
 * @param {object} [options] - Додаткові опції.
 * @param {boolean} [options.active=true] - Чи активний цей слухач.
 * @param {boolean} [options.preventDefault=true] - Чи викликати event.preventDefault().
 */
export const useKeybinding = (key, callback, options = {}) => {
  const { active = true, preventDefault = true } = options;
  const callbackRef = useRef(callback);

  // Оновлюємо ref, якщо callback змінився, щоб уникнути
  // зайвого пере-прив'язування слухача.
  useEffect(() => {
    callbackRef.current = callback;
  });

  useEffect(() => {
    // Якщо слухач неактивний, нічого не робимо.
    if (!active) {
      return;
    }

    const handleKeyDown = (event) => {
      const keys = Array.isArray(key) ? key : [key];

      // Перевіряємо, чи натиснута клавіша є однією з цільових.
      if (keys.includes(event.key)) {
        if (preventDefault) {
          event.preventDefault();
        }
        callbackRef.current(event);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    // Функція очищення, яка видаляє слухача.
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [key, active, preventDefault]); // Залежимо від `active`, щоб динамічно вмикати/вимикати.
};

import { useEffect } from 'react';

/**
 * Custom hook to dynamically update the document title.
 * @param {string} title - The title to display in the browser tab.
 */
export default function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} | AstonnyFlyy` : 'AstonnyFlyy - Modern Street Luxury';
  }, [title]);
}

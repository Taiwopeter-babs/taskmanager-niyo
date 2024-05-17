import { IPagination } from './types';

/** Computes the number of items to skip */
export default function getPaginationOffset(pageParams: IPagination) {
  let { pageNumber, pageSize } = pageParams;

  if (!pageNumber) {
    pageNumber = 1;
  }

  if (!pageSize) {
    pageSize = 10;
  }

  const pageOffset = (pageNumber - 1) * pageSize;
  return { pageNumber, pageSize, pageOffset };
}

import { IPagination } from './types';

/** Computes the number of items to skip */
export default function getPaginationOffset(pageParams: IPagination) {
  const { pageNumber, pageSize } = pageParams;
  const pageOffset = (pageNumber - 1) * pageSize;
  return pageOffset;
}

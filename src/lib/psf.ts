export const SQM_TO_SQFT = 10.7639;

export function toPsf(resalePrice: number, floorAreaSqm: number | null): number | null {
  if (!floorAreaSqm) return null;
  return resalePrice / (floorAreaSqm * SQM_TO_SQFT);
}

/** One element from `computeRouteMatrix` REST response (camelCase JSON). */
export type RouteMatrixElementJson = {
  originIndex?: number;
  destinationIndex?: number;
  status?: { code?: number; message?: string };
  condition?: string;
  distanceMeters?: number;
};

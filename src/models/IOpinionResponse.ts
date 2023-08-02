/**
 * The response body for opinion requests.
 */
export default interface IOpinionResponse {
  id: string;
  createdAt: Date;
  content: string;
  colorHue: number;
  votes?: {
    agree: number;
    disagree: number;
  };
}

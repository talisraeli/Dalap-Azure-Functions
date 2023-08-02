/**
 * The opinion base model interface
 */
export interface IOpinion {
  content: string;
  colorHue: number;
  votes: {
    agree: string[];
    disagree: string[];
  };
}

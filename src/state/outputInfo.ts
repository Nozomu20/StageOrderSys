export interface OutputInfo {
  title: string;
  date: string; // <input type="date"> の値(YYYY-MM-DD)
  groupName: string;
}

export const defaultOutputInfo: OutputInfo = {
  title: "",
  date: "",
  groupName: "",
};

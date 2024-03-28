export interface Poll {
    id: number,
    title: string,
    description: string,
    image: string,
    optionOne: string,
    optionTwo: string,
    votesFirstOption: number,
    votesSecondOption: number,
  }
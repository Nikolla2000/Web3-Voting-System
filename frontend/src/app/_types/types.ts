import { ReactNode } from "react";

export interface Poll {
    id: number,
    name: string,
    description: string,
    mainImgURL: string,
    img1URL: string,
    img2URL: string,
    optionOneName: string,
    optionTwoName: string,
    votes1: number,
    votes2: number,
  }

  export interface Percentages {
    left: number,
    right: number,
  }

  export interface PollLinkProps {
    id: number;
    children: ReactNode;
  }

  export enum ChosenOption {
    First = 'first',
    Second = 'second'
  }
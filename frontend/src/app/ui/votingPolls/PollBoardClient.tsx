"use client";

import { useEffect, useState } from "react";
import PollsBoard from "./pollsBoard";
import { Poll } from "@/app/_types/types";

const PollsBoardClient = ({ pollsData }: { pollsData: Poll[] }) => {
  const [chunkSize, setChunkSize] = useState(3);

  useEffect(() => {
    const updateChunkSize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setChunkSize(1);
      } else if (width < 1024) {
        setChunkSize(2);
      } else if (width < 1440) {
        setChunkSize(3);
      } else {
        setChunkSize(4);
      }
    };

    // Update chunk size on mount
    updateChunkSize();

    // Add event listener for window resize
    window.addEventListener("resize", updateChunkSize);

    // Cleanup event listener on unmount
    return () => {
      window.removeEventListener("resize", updateChunkSize);
    };
  }, []);

  return <PollsBoard pollsData={pollsData} chunkSize={chunkSize} />;
};

export default PollsBoardClient;

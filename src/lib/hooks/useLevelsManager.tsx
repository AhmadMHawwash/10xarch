import { useMemo, useState } from "react";
import levels from "../levels";
import { useDrawManager } from "./useDrawManager";

export const useLevelsManager = () => {
  // const [userSolution, setUserSolution] = useState<
  //   (typeof levels)[number]["solution"]["connect"]
  // >([]);
  const [currentLevel, setCurrentLevel] = useState(levels[0]);
  const { nodes } = useDrawManager();
  const nodesById = useMemo(
    () =>
      nodes.reduce(
        (acc, node) => {
          acc[node.id] = node;
          return acc;
        },
        {} as Record<string, (typeof nodes)[number]>,
      ),
    [nodes],
  );

  const updateUserSolution = (connection: {
    source: string;
    target: string;
  }) => {
    // const levelId = currentLevel?.id;
    // const level = levels.find((level) => level.id === levelId);
    // if (!level) return;

    // setUserSolution((userSolution) => {
    //   const updatedSolution = [...userSolution, connection];
    //   if (updatedSolution.length === level.solution.connect.length) {
    //     debugger;
    //     const isLevelSolved = updatedSolution.every((connection) => {
    //       const sourceNodeType = nodesById[connection.source]?.data?.name;
    //       const targetNodeType = nodesById[connection.target]?.data?.name;
    //       return level.solution.connect.find(
    //         (solutionConnection) =>
    //           solutionConnection.source === sourceNodeType &&
    //           solutionConnection.target === targetNodeType,
    //       );
    //     });
    //     console.log({ isLevelSolved });
    //     // if (isLevelSolved) {
    //     //   const nextLevel = levels.find(
    //     //     (level) => level.id === currentLevel?.nextLevelId
    //     //   );
    //     //   if (nextLevel) {
    //     //     setCurrentLevel(nextLevel);
    //     //     setUserSolution([]);
    //     //   }
    //     // }
    //   }
    //   return updatedSolution;
    // });
  };

  return {
    updateUserSolution,
    level: currentLevel,
  };
};

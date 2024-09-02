import { LevelContent } from "@/components/playground/LevelContent";
import SystemBuilder from "@/components/SystemDesigner";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

export default function Level() {
  return (
    <>
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={25} minSize={3}>
          <LevelContent />
        </ResizablePanel>
        <ResizableHandle className="w-1 bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 transition-colors" />
        <ResizablePanel defaultSize={75} minSize={60}>
          <SystemBuilder />
        </ResizablePanel>
      </ResizablePanelGroup>
      {/* <AIChatWidget /> */}
    </>
  );
}

const content = `
### Elements of a successful system design
&nbsp;
#### A successful system design should include the following elements:
- **Requirements**: 
  - Functional 
  - Non-functional requirements
- **System API**: 
  - API definitions
  - API flows
- **Capacity Estimations**: 
  - Traffic estimates
  - Storage estimates
  - Bandwidth estimates
  - Memory estimates
- **High level design**: System components and their connections
- **Database**: Models and purpose
- And other system components purposes
`;

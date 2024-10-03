import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useChallengeManager } from "@/lib/hooks/useChallengeManager";
import { CogIcon, InfoIcon, LightbulbIcon } from "lucide-react";
import { WithMarkdownDetails } from "../SystemComponents/Wrappers/WithMarkdownDetails";
import { Button } from "../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Textarea } from "../ui/textarea";
import { Muted } from "../ui/typography";
import { useWhiteboard } from "../ReactflowCustomNodes/APIsNode";

export const RequirementsDefinition: React.FC = () => {
  const { stage } = useChallengeManager();
  const { functional, nonfunctional, setFunctional, setNonfunctional } =
    useWhiteboard();

  return (
    <Dialog>
      <DialogTrigger className="mt-1 flex w-full items-center rounded-md border border-gray-400 bg-gray-50 p-1 px-2 text-sm font-medium text-gray-800 transition-all hover:border-gray-500 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200 dark:hover:border-gray-500 dark:hover:bg-gray-800">
        <>
          <CogIcon size={15} className="mr-2" />
          Requirements
        </>
      </DialogTrigger>
      <DialogContent className="h-[90vh] max-w-4xl overflow-scroll bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100">
        <DialogHeader>
          <DialogTitle className="mb-4 text-2xl font-bold">
            Requirements Definition
          </DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="functional" className="w-full">
          <TabsList className="mb-4 grid w-full grid-cols-2">
            <TabsTrigger value="functional">Functional</TabsTrigger>
            <TabsTrigger value="nonfunctional">Non-functional</TabsTrigger>
          </TabsList>
          <TabsContent value="functional">
            <RequirementSection
              value={functional}
              onChange={setFunctional}
              placeholder="Example: User Authentication, Data Processing, etc."
              infoContent={functionalRequirements}
              infoButtonText="What the system should do"
            />
            <Hints hints={stage?.hintsPerArea.requirements.functional} />
          </TabsContent>
          <TabsContent value="nonfunctional">
            <RequirementSection
              value={nonfunctional}
              onChange={setNonfunctional}
              placeholder="Example: Performance, Scalability, Security, etc."
              infoContent={nonFunctionalRequirements}
              infoButtonText="How the system should perform"
            />
            <Hints hints={stage?.hintsPerArea.requirements.nonFunctional} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

interface RequirementSectionProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  infoContent: string;
  infoButtonText: string;
}

const RequirementSection: React.FC<RequirementSectionProps> = ({
  value,
  onChange,
  placeholder,
  infoContent,
  infoButtonText,
}) => (
  <div className="space-y-4">
    <Textarea
      rows={15}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="text-md border-gray-300 bg-gray-100 text-gray-900 focus:border-gray-400 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-gray-600"
    />
    <WithMarkdownDetails
      Icon={InfoIcon}
      trigger={
        <Button
          variant="ghost"
          size="sm"
          className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <InfoIcon className="mr-2" size={16} />
          {infoButtonText}
        </Button>
      }
      content={infoContent}
    />
  </div>
);

interface HintsProps {
  hints?: string[];
}

export const Hints: React.FC<HintsProps> = ({ hints = [] }) => {
  const { currentStageIndex, challenge } = useChallengeManager();
  if (!challenge || hints.length === 0) return null;
  return (
    <div className="mt-6 rounded-lg bg-gray-100 p-4 dark:bg-gray-800">
      <Muted className="mb-2 flex items-center text-gray-700 dark:text-gray-300">
        <LightbulbIcon size={16} className="mr-2" />
        Hints for {challenge.title} - Part {currentStageIndex + 1}/
        {challenge.stages.length}
      </Muted>
      <ul className="list-inside list-disc space-y-1">
        {hints.map((hint, index) => (
          <li key={index} className="text-gray-800 dark:text-gray-200">
            {hint}
          </li>
        ))}
      </ul>
    </div>
  );
};

const functionalRequirements = `# Functional Requirements

## Introduction
Functional requirements define the specific behavior or functions of a system. They describe what the system should do, outlining the features and capabilities that must be implemented to satisfy user needs and business objectives. These requirements are essential for ensuring that the system delivers the expected outcomes and meets the stakeholders' expectations.

## Characteristics of Functional Requirements
Functional requirements should be:
1. **Clear and Unambiguous**: Each requirement should be stated clearly to avoid misinterpretation.
2. **Complete**: All necessary functions and behaviors should be included.
3. **Consistent**: Requirements should not conflict with each other.
4. **Traceable**: Each requirement should be traceable to a specific business need or objective.
5. **Verifiable**: It should be possible to verify that the requirement has been implemented correctly.

## Common Types of Functional Requirements
Functional requirements can vary widely depending on the system, but some common types include:

### User Interactions
- **User Authentication**: Users must be able to register, log in, and log out of the system.
- **User Permissions**: Different levels of access and permissions must be implemented for different types of users.
- **User Profiles**: Users should be able to create and manage their profiles.

### Data Management
- **Data Input**: The system should allow users to input data through forms or other means.
- **Data Processing**: The system should process the input data according to business rules.
- **Data Storage**: The system should store data in a structured manner.
- **Data Retrieval**: Users must be able to retrieve data quickly and efficiently.
- **Data Modification**: Users should be able to modify existing data.
- **Data Deletion**: Users must be able to delete data when necessary.

### System Operations
- **Business Rules**: The system should enforce business rules and constraints.
- **Transaction Handling**: The system should handle transactions and ensure data integrity.
- **Reporting**: The system should generate reports based on the stored data.
- **Notifications**: The system should notify users of important events or changes.
- **Error Handling**: The system should handle errors gracefully and provide meaningful error messages.

### Integration
- **External Interfaces**: The system should integrate with external systems and services.
- **API**: The system should expose APIs for external interactions.
- **Data Import/Export**: The system should allow data to be imported from and exported to external systems.

## Example: Functional Requirements for a URL Shortening Service

### User Interactions
- **Create Short URL**: Users must be able to input a long URL and receive a shortened URL.
- **Retrieve Original URL**: Users should be able to input a short URL and receive the original long URL.
- **Custom Alias**: Users can optionally specify a custom alias for the short URL.
- **URL Expiration**: Users can set an expiration date for the short URL.

### Data Management
- **Store URL Mappings**: The system should store mappings between short URLs and long URLs.
- **Update URL Mappings**: Users should be able to update existing short URL mappings.
- **Delete URL Mappings**: Users must be able to delete short URL mappings.

### System Operations
- **Redirect Requests**: The system should redirect requests from the short URL to the original long URL.
- **Track Usage**: The system should track the number of times a short URL is accessed.
- **Generate Analytics**: The system should generate usage analytics for each short URL.

### Integration
- **API Access**: The system should provide APIs for creating, retrieving, and managing short URLs.
- **Third-Party Integration**: The system should integrate with third-party analytics and monitoring services.

## Conclusion
Functional requirements are crucial for defining the expected behavior of a system. They ensure that the system meets user needs and business goals by specifying what the system should do. Clear, complete, and verifiable functional requirements are essential for the successful development and implementation of any system.
`;

const nonFunctionalRequirements = `# Non-Functional Requirements

## Introduction
Non-functional requirements define the system's operational attributes and quality characteristics. Unlike functional requirements, which specify what the system should do, non-functional requirements describe how the system should perform its functions. These requirements are essential for ensuring the system's usability, reliability, performance, and overall user satisfaction.

## Characteristics of Non-Functional Requirements
Non-functional requirements should be:
1. **Measurable**: They should be quantifiable to allow for objective assessment.
2. **Realistic**: They should be achievable given the project constraints.
3. **Clear and Concise**: Each requirement should be easy to understand and unambiguous.
4. **Testable**: It should be possible to verify that the requirement has been met.

## Common Types of Non-Functional Requirements
Non-functional requirements can cover a wide range of quality attributes, let's call them  including:

### Performance
- **Response Time**: The time it takes for the system to respond to a user request.
- **Throughput**: The number of transactions the system can process within a given time frame.
- **Scalability**: The system's ability to handle increased load by adding resources.

### Reliability
- **Availability**: The percentage of time the system is operational and accessible.
- **Recoverability**: The system's ability to recover from failures and restore normal operations.
- **Fault Tolerance**: The system's ability to continue functioning in the event of a component failure.

### Usability
- **Ease of Use**: How intuitive and easy it is for users to interact with the system.
- **Accessibility**: The system's ability to be used by people with varying abilities.
- **Consistency**: The uniformity of the user interface and user experience.

### Security
- **Confidentiality**: Ensuring that sensitive information is accessible only to authorized users.
- **Integrity**: Protecting data from unauthorized modifications.
- **Authentication and Authorization**: Verifying user identities and controlling access to system resources.

### Maintainability
- **Modularity**: The degree to which the system's components can be separated and recombined.
- **Reusability**: The ability to use system components in other systems or projects.
- **Extensibility**: The ease with which the system can be extended with new features.

### Portability
- **Compatibility**: The system's ability to operate in different environments and platforms.
- **Installability**: The ease with which the system can be installed and configured.
- **Adaptability**: The ability to modify the system to fit different environments or requirements.

### Other Attributes
- **Compliance**: Adherence to regulatory requirements and industry standards.
- **Cost**: The financial constraints related to the development and operation of the system.
- **Environmental Impact**: The system's effect on the environment, such as energy consumption.

## Example: Non-Functional Requirements for a URL Shortening Service

### Performance
- **Response Time**: The system should respond to URL shortening and redirection requests within 200 milliseconds.
- **Throughput**: The system should handle 10,000 URL shortenings and 1,000,000 redirections per hour.
- **Scalability**: The system should scale horizontally to accommodate growing traffic.

### Reliability
- **Availability**: The system should have an uptime of 99.9% per month.
- **Recoverability**: The system should recover from failures within 5 minutes.
- **Fault Tolerance**: The system should continue to function even if a single server fails.

### Usability
- **Ease of Use**: The user interface should be intuitive and easy to use for all users.
- **Accessibility**: The system should be compliant with WCAG 2.1 accessibility standards.
- **Consistency**: The user interface should provide a consistent experience across all pages.

### Security
- **Confidentiality**: Only authenticated users should be able to create, modify, or delete short URLs.
- **Integrity**: The system should protect URL mappings from unauthorized changes.
- **Authentication and Authorization**: The system should use OAuth 2.0 for secure user authentication and authorization.

### Maintainability
- **Modularity**: The system should have a modular architecture to facilitate updates and maintenance.
- **Reusability**: Common components should be reusable across different parts of the system.
- **Extensibility**: The system should allow for easy addition of new features without major changes.

### Portability
- **Compatibility**: The system should be compatible with major web browsers and operating systems.
- **Installability**: The system should be easy to install and configure on cloud platforms.
- **Adaptability**: The system should be easily configurable to meet different business requirements.

### Compliance
- **Compliance**: The system should comply with GDPR for data protection and privacy.

> Note: you don't need to include all of these requirements in your system, only the ones that are relevant to your specific use case.
---

## Conclusion
Non-functional requirements are crucial for defining the quality attributes and operational characteristics of a system. They ensure that the system not only performs its intended functions but also meets the desired performance, reliability, usability, security, and maintainability standards. Clear and measurable non-functional requirements are essential for the successful development and deployment of any system.
`;

import type { ReactNode } from "react";

const Links = ["Dashboard", "Projects", "Team"];

const NavLink = ({ children }: { children: ReactNode }) => null;
// <Link
//   px={2}
//   py={1}
//   rounded={"md"}
//   _hover={{
//     textDecoration: "none",
//     bg: useColorModeValue("gray.200", "gray.700"),
//   }}
//   href={"#"}
// >
//   <Text>{children}</Text>
// </Link>

export default function Navbar() {
  // const { isOpen, onOpen, onClose } = useDisclosure();
  // const { isSignedIn } = useUser();

  return null;
  // return (
  //   <>
  //     <Box bg={useColorModeValue("gray.100", "gray.900")} px={4}>
  //       <Flex h={16} alignItems={"center"} justifyContent={"space-between"}>
  //         <IconButton
  //           size={"md"}
  //           icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
  //           aria-label={"Open Menu"}
  //           display={{ md: "none" }}
  //           onClick={isOpen ? onClose : onOpen}
  //         />
  //         <HStack spacing={8} alignItems={"center"}>
  //           {/* <Box>Logo</Box> */}
  //           <HStack
  //             as={"nav"}
  //             spacing={4}
  //             display={{ base: "none", md: "flex" }}
  //           >
  //             {Links.map((link) => (
  //               <NavLink key={link}>{link}</NavLink>
  //             ))}
  //           </HStack>
  //         </HStack>

  //         {isSignedIn ? (
  //           <UserButton afterSignOutUrl="/" />
  //         ) : (
  //           <Stack
  //             flex={{ base: 1, md: 0 }}
  //             justify={"flex-end"}
  //             direction={"row"}
  //             spacing={6}
  //           >
  //             <Button
  //               as={Link}
  //               colorScheme="teal"
  //               variant="link"
  //               href="/sign-in"
  //             >
  //               Sign In
  //             </Button>
  //             <Button
  //               as={Link}
  //               colorScheme="teal"
  //               display={{ base: "none", md: "inline-flex" }}
  //               href="/sign-up"
  //             >
  //               Sign Up
  //             </Button>
  //           </Stack>
  //         )}
  //       </Flex>

  //       {isOpen ? (
  //         <Box pb={4} display={{ md: "none" }}>
  //           <Stack as={"nav"} spacing={4}>
  //             {Links.map((link) => (
  //               <NavLink key={link}>{link}</NavLink>
  //             ))}
  //           </Stack>
  //         </Box>
  //       ) : null}
  //     </Box>
  //   </>
  // );
}

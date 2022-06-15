import { Avatar } from "@chakra-ui/avatar";
import { Button, Box, Text } from '@chakra-ui/react'
import { useAuth } from "../../hooks/useAuth";

export default function UserListItem (props) {
  const { u, handleGroup } = props;
  return (
    <Button 
      display='flex'
      onClick={handleGroup(u)}
      cursor="pointer"
      bg="#E8E8E8"
      _hover={{
        background: "#38B2AC",
        color: "white",
      }}
      w="100%"
      alignItems="center"
      color="black"
      px={3}
      py={2}
      mb={2}
      borderRadius="lg"
    >
      <Avatar
        mr={2}
        size="sm"
        cursor="pointer"
        name={u.name}
        src={u.photoURL}
      />
      <Box>
        <Text>{u.name}</Text>
        <Text fontSize="xs">
          <b>Email : </b>
          {u.email}
        </Text>
      </Box>
    </Button>
  );
};
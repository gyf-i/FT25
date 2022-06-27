import { Avatar, Box, Button, Center, Flex, FormLabel, Heading, InputRightElement, Menu, MenuButton, MenuIcon, MenuItem, MenuList, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Text, useDisclosure } from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AddIcon, ArrowBackIcon, HamburgerIcon } from "@chakra-ui/icons";
import { FormControl ,Input, useToast, HStack, Stack, IconButton } from "@chakra-ui/react";
import { query, onSnapshot, orderBy,limit,collection, getDoc, doc, addDoc, serverTimestamp, updateDoc, arrayUnion } from "firebase/firestore";
import { useCollectionData, useDocumentData } from 'react-firebase-hooks/firestore';

import { useAuth } from "../../hooks/useAuth";


import Stopwatch from "./RMstopWatch";






  import UserListItem from "../user/UserListitem";
import UserBadgeItem from "../user/UserBadgeItem";


export default function FocusRoom() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { u_id, r_id } = state;
  const { db, user } = useAuth();
  //const [room, setRoom] = useState("");
  const bottomOfChat = useRef();

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [typing, setTyping] = useState(false);
  const [istyping, setIsTyping] = useState(false);
  const toast = useToast();

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchResult, setSearchResult] = useState([]);
  const [queryres, setQueryres] = useState("");
  const q = query(collection(db, "users"));
  const [allUsers] = useCollectionData(q);
  const users_list = allUsers?.filter((u) => u.uid !== user.uid);

  /*
  useEffect(() => {
    async function FetchRoom() {
      const docRef = doc(db, "groups", r_id);
      const docSnap = await getDoc(docRef);
      setRoom(docSnap.data());
    }
    FetchRoom();
  }, []);
  */

  const handleSearch = (e) => {
    setQueryres(e.target.value);
    if (!query) {
      return;
    }
    console.log("query", queryres);
    setLoading(true);
    if (queryres === "" || queryres === null) {
      return;
    }
    const result = users_list.filter((person) => {
      return person.name?.toLowerCase().startsWith(queryres.toLowerCase());
    });
    console.log("result", result);
    setSearchResult(result);
    setLoading(false);
  };
  const handleDelete = (delUser) => {
    setSelectedUsers(selectedUsers.filter((sel) => sel.uid !== delUser.uid));
  };
  const handleGroup = (userToAdd) => {
    if (selectedUsers.includes(userToAdd)) {
      toast({
        title: "User already selected",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
    } else {
      setSelectedUsers([...selectedUsers, userToAdd]);
      setQueryres("");
    }
  };
  const handleAddFriends = () => {
    if (!selectedUsers.length) {
      toast({
        title: "No user to add",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      return;
    }
    console.log("selected", selectedUsers);
    selectedUsers.forEach(async (u) => {
      const ref = doc(db, "users", u.uid);
      console.log("u", u.uid);
      await updateDoc(ref, {
        rooms: arrayUnion(r_id)
      });
      const room_ref = doc(db, "groups", r_id);
      await updateDoc(room_ref, {
        members: arrayUnion(u.uid)
      })
    });
    onClose();
    toast({
      title: "User added!",
      status: "success",
      duration: 5000,
      isClosable: true,
      position: "bottom",
    });
  };

  useEffect(() => {
    if (!user) {
      navigate("/");
    }
  }, [user]);

  const [room] = useDocumentData(doc(db, "groups", r_id));
  console.log("romm", room);

  useEffect(() => {
    const colRef = collection(db, `messages/${room?.id}/msg`);
    const q = query(colRef, orderBy("createdAt"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const allMessages = [];
      console.log("snap", querySnapshot);
      querySnapshot.forEach((doc) => {
        console.log("q_data", doc.data());
        allMessages.push(doc.data());
      });
      setMessages(allMessages);
      console.log("allMessages", allMessages);
      console.log("messages", messages);
    });

    return () => unsubscribe();
  }, [db, room?.id]);

  const sendMessage = async (e) => {
    e.preventDefault();
    console.log("newmessage:", newMessage);
    const colRef = collection(db, `messages/${room.id}/msg`);
    await addDoc(colRef, {
      text: newMessage,
      createdAt: serverTimestamp(),
      sentBy: user.uid,
      email: user.email,
    });
    setNewMessage("");
  };

  const typingHandler = (e) => {
    setNewMessage(e.target.value);
    if (!typing) {
      setTyping(true);
    }
  };

  function topBar() {
    return (
      <Flex
        bg="gray.100"
        h="71px"
        w="100%"
        align="center"
        p={2}
        justifyContent="space-between"
      >
        <IconButton icon={<ArrowBackIcon />} onClick={() => navigate(-1)} />
        <Stack direction="row">
          <Avatar size="sm" src="" marginEnd={3} />
          <Heading size="lg">{room?.name} </Heading>
        </Stack>
        <Menu>
          <MenuButton
            as={IconButton}
            aria-label="Options"
            icon={<HamburgerIcon />}
            variant="outline"
          />
          <MenuList>
            <>
              <MenuItem
                icon={<AddIcon />}
                command="⌘T"
                onClick={(e) => onOpen()}
              >
                Add member
              </MenuItem>{" "}
              <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                  <ModalHeader>Add friend</ModalHeader>
                  <ModalCloseButton />
                  <ModalBody>
                    <FormControl mt={2}>
                      <FormLabel>Add user</FormLabel>
                      <Input
                        value={queryres}
                        placeholder="Add users"
                        mb={3}
                        onChange={handleSearch}
                      />
                    </FormControl>
                    <Box w="100%" d="flex" flexWrap="wrap">
                      {selectedUsers.map((u) => (
                        <UserBadgeItem
                          u={u}
                          handleDelete={() => handleDelete(u)}
                        />
                      ))}
                    </Box>
                    {loading ? (
                      // <ChatLoading />
                      <div>Loading...</div>
                    ) : searchResult.length > 0 ? (
                      searchResult
                        .slice(0, 5)
                        .map((u) => (
                          <UserListItem
                            u={u}
                            handleGroup={() => handleGroup(u)}
                          />
                        ))
                    ) : (
                      <Box mt="15px" ml="20px">
                        No user found
                      </Box>
                    )}
                  </ModalBody>

                  <ModalFooter>
                    <Button
                      colorScheme="blue"
                      mr={3}
                      onClick={() => handleAddFriends()}
                    >
                      Add
                    </Button>
                  </ModalFooter>
                </ModalContent>
              </Modal>
            </>
          </MenuList>
        </Menu>
      </Flex>
    );
  }
  function bottomBar() {
    return (
      <FormControl p={3} onSubmit={sendMessage} as="form">
        <Input
          placeholder="Type a message..."
          autoComplete="off"
          onChange={(e) => typingHandler(e)}
          value={newMessage}
        />
        <Button type="submit" hidden>
          Submit
        </Button>
      </FormControl>
    );
  }

  useEffect(() => {
    setTimeout(
      bottomOfChat.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      }),
      100
    );
  }, [messages]);

  const getMessages = () =>
    messages?.map((msg, index) => {
      const sender = msg.sentBy === user.uid;
      return (
        <Flex
          key={index + 1}
          alignSelf={sender ? "flex-end" : "flex-start"}
          bg={sender ? "green.100" : "blue.100"}
          direction="column"
          w="fit-content"
          minWidth="100px"
          borderRadius="lg"
          p={2}
          m={1}
        >
          <Text mb={1} color="orange.700">
            {msg.email}
          </Text>
          <Text>{msg.text}</Text>
        </Flex>
      );
    });

  return (
    <Flex h="93vh" direction="column">
      {topBar()}
      <Flex bg="blue.100" h="71px" w="110%" align="center" p={2}>
        <Flex flex={1}>
          <Center w="100%" h="100%">
            <Heading size="lg">
              <Stopwatch />{" "}
            </Heading>
          </Center>
        </Flex>
      </Flex>

      <Flex
        flex={1}
        direction="column"
        pt={4}
        mx={5}
        overflowX="scroll"
        sx={{ scrollbarWidth: "none" }}
      >
        {getMessages()}
        <div ref={bottomOfChat}></div>
      </Flex>
      {bottomBar()}
    </Flex>
  );
}
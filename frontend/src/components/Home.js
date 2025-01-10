import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../config/api';
import toast from 'react-hot-toast';
import Confetti from 'react-confetti';
import { Tooltip } from 'react-tooltip';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import PeopleIcon from '@mui/icons-material/People';
import FavoriteIcon from '@mui/icons-material/Favorite';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import UserCardSkeleton from './UserCardSkeleton';

const friendshipQuotes = [
  "A friend is one soul dwelling in two bodies.",
  "Friendship is born at that moment when one person says to another, 'What! You too?'",
  "True friendship multiplies the good in life and divides its evils.",
  "A real friend is one who walks in when the rest of the world walks out."
];

const Container = styled.div`
  min-height: 100vh;
  padding: 2rem;
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  transition: all 0.3s ease;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const ThemeToggle = styled(motion.button)`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const Logo = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.primary};
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  color: ${({ theme }) => theme.colors.text};
`;

const LogoutButton = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  color: ${({ theme }) => theme.colors.text};
  border: 1px solid ${({ theme }) => theme.colors.text};
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.surface};
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const BentoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
`;

const BentoBox = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 16px;
  padding: 1.5rem;
  transition: all 0.3s ease;
`;

const QuoteBox = styled.div`
  grid-column: 1 / -1;
  text-align: center;
  font-style: italic;
  color: ${({ theme }) => theme.colors.primary};
  font-size: 1.2rem;
`;

const SearchBox = styled.div`
  display: flex;
  align-items: center;
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 8px;
  padding: 0.5rem 1rem;
  margin-bottom: 1rem;
  gap: 0.5rem;

  input {
    flex: 1;
    background: transparent;
    border: none;
    color: ${({ theme }) => theme.colors.text};
    padding: 0.5rem;
    outline: none;

    &::placeholder {
      color: ${({ theme }) => theme.colors.textSecondary};
    }
  }
`;

const SectionTitle = styled.h2`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 1rem;
  font-size: 1.2rem;
`;

const UserCard = styled(motion.div)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 8px;
  margin-bottom: 0.5rem;
  transition: all 0.3s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.surfaceHover};
  }
`;

const Username = styled.span`
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text};
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ActionButton = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s ease;
`;

const AddButton = styled(ActionButton)`
  background: ${({ theme }) => theme.colors.primary};
  color: white;

  &:hover {
    background: ${({ theme }) => theme.colors.primaryHover};
  }
`;

const DeclineButton = styled(ActionButton)`
  background: ${({ theme }) => theme.colors.error};
  color: white;

  &:hover {
    background: ${({ theme }) => theme.colors.errorHover};
  }
`;

const AcceptButton = styled(ActionButton)`
  background: ${({ theme }) => theme.colors.success};
  color: white;

  &:hover {
    background: ${({ theme }) => theme.colors.successHover};
  }
`;

const RemoveButton = styled(ActionButton)`
  background: ${({ theme }) => theme.colors.error};
  color: white;

  &:hover {
    background: ${({ theme }) => theme.colors.errorHover};
  }
`;

const PendingButton = styled(ActionButton)`
  background: ${({ theme }) => theme.colors.pending};
  color: white;
  cursor: not-allowed;
`;

const EmptyState = styled.div`
  text-align: center;
  color: ${({ theme }) => theme.colors.textSecondary};
  padding: 2rem;
`;

const ErrorMessage = styled.div`
  text-align: center;
  background-color: ${({ theme }) => theme.colors.error};
  color: white;
  padding: 10px 20px;
  border-radius: 5px;
  margin-bottom: 1rem;
`;

const Home = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  const [users, setUsers] = useState([]);
  const [friends, setFriends] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const [usersResponse, friendsResponse, sentResponse, receivedResponse] = await Promise.all([
        api.get('/users'),
        api.get('/friends'),
        api.get('/friends/requests/sent'),
        api.get('/friends/requests/received')
      ]);

      const currentFriends = friendsResponse.data;
      const sentRequests = sentResponse.data;
      const receivedRequests = receivedResponse.data;

      // Filter out current user and process user statuses
      const filteredUsers = usersResponse.data
        .filter(u => u._id !== user._id)
        .map(u => ({
          ...u,
          isFriend: currentFriends.some(f => f._id === u._id),
          requestSent: sentRequests.some(r => r._id === u._id),
          requestReceived: receivedRequests.some(r => r._id === u._id)
        }));

      setUsers(filteredUsers);
      setFriends(currentFriends);
      setSentRequests(sentRequests);
      setReceivedRequests(receivedRequests);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = async (userId) => {
    try {
      await api.post(`/friends/request/${userId}`);
      toast.success('Friend request sent!');
      fetchUsers(); // Refresh the user list
    } catch (error) {
      console.error('Error sending friend request:', error);
      toast.error('Failed to send friend request');
    }
  };

  const handleAcceptRequest = async (userId) => {
    try {
      await api.post(`/friends/accept/${userId}`);
      setShowConfetti(true);
      toast.success('Friend request accepted!');
      fetchUsers(); // Refresh the user list
      setTimeout(() => setShowConfetti(false), 3000);
    } catch (error) {
      console.error('Error accepting friend request:', error);
      toast.error('Failed to accept friend request');
    }
  };

  const handleDeclineRequest = async (userId) => {
    try {
      await api.post(`/friends/decline/${userId}`);
      toast.success('Friend request declined');
      fetchUsers(); // Refresh the user list
    } catch (error) {
      console.error('Error declining friend request:', error);
      toast.error('Failed to decline friend request');
    }
  };

  const handleRemoveFriend = async (userId) => {
    try {
      await api.post(`/friends/remove/${userId}`);
      toast.success('Friend removed');
      fetchUsers(); // Refresh the user list
    } catch (error) {
      console.error('Error removing friend:', error);
      toast.error('Failed to remove friend');
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchUsers();
  }, [user, navigate]);

  const getButtonForUser = (user) => {
    if (!user?._id) return null;

    // Check if user is already a friend
    const isFriend = friends?.some(friend => friend?._id === user._id);
    if (isFriend) {
      return (
        <RemoveButton onClick={() => handleRemoveFriend(user._id)}>
          <CloseIcon sx={{ fontSize: 16 }} /> Remove
        </RemoveButton>
      );
    }
    
    // Check if request is already sent
    const isRequestSent = sentRequests?.some(request => request?.to?._id === user._id);
    if (isRequestSent) {
      return (
        <PendingButton disabled>
          Request Sent
        </PendingButton>
      );
    }

    // Check if request is received
    const isRequestReceived = receivedRequests?.some(request => request?.from?._id === user._id);
    if (isRequestReceived) {
      return (
        <ButtonGroup>
          <AcceptButton onClick={() => handleAcceptRequest(user._id)}>
            <CheckIcon sx={{ fontSize: 16 }} /> Accept
          </AcceptButton>
          <DeclineButton onClick={() => handleDeclineRequest(user._id)}>
            <CloseIcon sx={{ fontSize: 16 }} /> Decline
          </DeclineButton>
        </ButtonGroup>
      );
    }
    
    return (
      <AddButton onClick={() => handleSendRequest(user._id)}>
        <PersonAddIcon sx={{ fontSize: 16 }} /> Add Friend
      </AddButton>
    );
  };

  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Container theme={theme}>
      {showConfetti && <Confetti />}
      
      <Header>
        <Logo>Mittr</Logo>
        <UserInfo>
          <FavoriteIcon sx={{ color: theme.colors.secondary }} />
          <span>Welcome, {user?.username}</span>
          <ThemeToggle
            onClick={toggleTheme}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            theme={theme}
          >
            {theme.isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
          </ThemeToggle>
          <LogoutButton 
            onClick={() => {
              logout();
              navigate('/login');
            }}
            data-tooltip-id="logout-tooltip"
            data-tooltip-content="Logout from your account"
          >
            <CloseIcon sx={{ fontSize: 16 }} />
            Logout
          </LogoutButton>
        </UserInfo>
      </Header>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      <QuoteBox
        as={motion.div}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        theme={theme}
      >
        {friendshipQuotes[Math.floor(Math.random() * friendshipQuotes.length)]}
      </QuoteBox>

      <SearchBox theme={theme}>
        <SearchIcon sx={{ color: theme.colors.primary, fontSize: 16 }} />
        <input
          type="text"
          placeholder="Search users by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </SearchBox>

      <BentoGrid>
        {loading ? (
          <UserCardSkeleton count={6} />
        ) : (
          <>
            {receivedRequests.length > 0 && (
              <BentoBox theme={theme}>
                <SectionTitle theme={theme}>
                  <PersonAddIcon sx={{ fontSize: 16 }} />
                  Friend Requests
                </SectionTitle>
                <AnimatePresence>
                  {receivedRequests.map(request => (
                    <UserCard
                      key={`request-${request.from._id}`}
                      as={motion.div}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      theme={theme}
                    >
                      <Username>{request.from.username}</Username>
                      <ButtonGroup>
                        <AcceptButton
                          onClick={() => handleAcceptRequest(request.from._id)}
                          data-tooltip-id="accept-tooltip"
                          data-tooltip-content="Accept friend request"
                        >
                          <CheckIcon sx={{ fontSize: 16 }} /> Accept
                        </AcceptButton>
                        <DeclineButton
                          onClick={() => handleDeclineRequest(request.from._id)}
                          data-tooltip-id="decline-tooltip"
                          data-tooltip-content="Decline friend request"
                        >
                          <CloseIcon sx={{ fontSize: 16 }} /> Decline
                        </DeclineButton>
                      </ButtonGroup>
                    </UserCard>
                  ))}
                </AnimatePresence>
              </BentoBox>
            )}

            <BentoBox theme={theme}>
              <SectionTitle theme={theme}>
                <SearchIcon sx={{ fontSize: 16 }} />
                All Users
              </SectionTitle>
              {filteredUsers.length > 0 ? (
                <AnimatePresence>
                  {filteredUsers
                    .filter(user => !friends?.some(friend => friend?._id === user._id) && !receivedRequests?.some(request => request?.from?._id === user._id))
                    .map(user => (
                      <UserCard
                        key={`user-${user._id}`}
                        as={motion.div}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        theme={theme}
                      >
                        <Username>{user.username}</Username>
                        {getButtonForUser(user)}
                      </UserCard>
                    ))}
                </AnimatePresence>
              ) : (
                <EmptyState theme={theme}>No users found</EmptyState>
              )}
            </BentoBox>

            <BentoBox theme={theme}>
              <SectionTitle theme={theme}>
                <PeopleIcon sx={{ fontSize: 16 }} />
                Friends
              </SectionTitle>
              {friends.length > 0 ? (
                <AnimatePresence>
                  {friends.map(friend => (
                    <UserCard
                      key={`friend-${friend._id}`}
                      as={motion.div}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      theme={theme}
                    >
                      <Username>{friend.username}</Username>
                      <RemoveButton
                        onClick={() => handleRemoveFriend(friend._id)}
                        data-tooltip-id="remove-tooltip"
                        data-tooltip-content="Remove friend"
                      >
                        <CloseIcon sx={{ fontSize: 16 }} /> Remove
                      </RemoveButton>
                    </UserCard>
                  ))}
                </AnimatePresence>
              ) : (
                <EmptyState theme={theme}>No friends added yet</EmptyState>
              )}
            </BentoBox>
          </>
        )}
      </BentoGrid>

      <Tooltip id="logout-tooltip" />
      <Tooltip id="accept-tooltip" />
      <Tooltip id="decline-tooltip" />
      <Tooltip id="remove-tooltip" />
    </Container>
  );
};

export default Home;

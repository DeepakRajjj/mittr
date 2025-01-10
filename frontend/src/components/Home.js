import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Tooltip } from 'react-tooltip';
import toast from 'react-hot-toast';
import Confetti from 'react-confetti';
import UserCardSkeleton from './UserCardSkeleton';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PeopleIcon from '@mui/icons-material/People';
import SearchIcon from '@mui/icons-material/Search';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import LogoutIcon from '@mui/icons-material/Logout';
import FavoriteIcon from '@mui/icons-material/Favorite';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import { endpoints } from '../config/api';

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

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');

      const [usersRes, friendsRes, receivedRes, sentRes] = await Promise.all([
        endpoints.users.getAll(),
        endpoints.friends.getAll(),
        endpoints.friends.requests.getReceived(),
        endpoints.friends.requests.getSent(),
      ]);

      setUsers(usersRes.data || []);
      setFriends(friendsRes.data || []);
      setReceivedRequests(receivedRes.data || []);
      setSentRequests(sentRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error.response?.data?.message || 'Error fetching data');
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchData();
  }, [user, navigate]);

  const handleFriendRequest = async (userId) => {
    try {
      await endpoints.friends.requests.send(userId);
      toast.success('Friend request sent!');
      await fetchData();
    } catch (error) {
      console.error('Error sending friend request:', error);
      toast.error(error.response?.data?.message || 'Failed to send friend request');
    }
  };

  const handleAcceptRequest = async (userId) => {
    try {
      await endpoints.friends.requests.accept(userId);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
      toast.success('Friend request accepted!');
      await fetchData();
    } catch (error) {
      console.error('Error accepting friend request:', error);
      toast.error(error.response?.data?.message || 'Failed to accept friend request');
    }
  };

  const handleDeclineRequest = async (userId) => {
    try {
      await endpoints.friends.requests.decline(userId);
      toast.success('Friend request declined!');
      await fetchData();
    } catch (error) {
      console.error('Error declining friend request:', error);
      toast.error(error.response?.data?.message || 'Failed to decline friend request');
    }
  };

  const handleRemoveFriend = async (userId) => {
    try {
      await endpoints.friends.remove(userId);
      toast.success('Friend removed');
      await fetchData();
    } catch (error) {
      console.error('Error removing friend:', error);
      toast.error(error.response?.data?.message || 'Failed to remove friend');
    }
  };

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
      <AddButton onClick={() => handleFriendRequest(user._id)}>
        <PersonAddIcon sx={{ fontSize: 16 }} /> Add Friend
      </AddButton>
    );
  };

  // Filter valid users and exclude current user and friends
  const validUsers = users?.filter(user => 
    user?._id && 
    user?.username && 
    user._id !== user?.id &&
    !friends?.some(friend => friend?._id === user._id)
  ) || [];

  const filteredUsers = validUsers.filter(user => 
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const validFriends = friends?.filter(friend => friend?._id && friend?.username) || [];
  const validReceivedRequests = receivedRequests?.filter(request => 
    request?.from?._id && request?.from?.username
  ) || [];

  // Create sets for quick lookups
  const friendIds = new Set(validFriends.map(friend => friend._id));
  const receivedRequestIds = new Set(validReceivedRequests.map(request => request.from._id));
  const sentRequestIds = new Set(sentRequests?.map(request => request?.to?._id).filter(Boolean));

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

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
            onClick={handleLogout}
            data-tooltip-id="logout-tooltip"
            data-tooltip-content="Logout from your account"
          >
            <LogoutIcon sx={{ fontSize: 16 }} />
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
            {validReceivedRequests.length > 0 && (
              <BentoBox theme={theme}>
                <SectionTitle theme={theme}>
                  <PersonAddIcon sx={{ fontSize: 16 }} />
                  Friend Requests
                </SectionTitle>
                <AnimatePresence>
                  {validReceivedRequests.map(request => (
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
                    .filter(user => !friendIds.has(user._id) && !receivedRequestIds.has(user._id))
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
              {validFriends.length > 0 ? (
                <AnimatePresence>
                  {validFriends.map(friend => (
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

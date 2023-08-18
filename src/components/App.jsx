import Header from "./Header/Header.jsx";
import Main from "./Main/Main.jsx";
import Footer from "./Footer/Footer.jsx";
import CurrentUserContext from "../contexts/CurrentUserContext.js";
// Импорт компонентов Реакт
import { useCallback, useEffect, useState } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
// Импорт Попапов
import EditProfilePopup from "./EditProfilePopup/EditProfilePopup.jsx";
import EditAvatarPopup from "./EditAvatarPopup/EditAvatarPopup.jsx";
import EditDeletePopup from "./EditDeletePopup/EditDeletePopup.jsx";
import AddPlacePopup from "./AddPlacePopup/AddPlacePopup.jsx";
import ImagePopup from "./ImagePopup/ImagePopup.jsx";
// Импорт новых компонентов для 12ПР
import InfoTooltip from "./InfoTooltip/InfoTooltip.jsx";
import ProtectedRoute from "./ProtectedRoute/ProtectedRoute.jsx";
import Login from "./Login/Login.jsx";
import Register from "./Register/Register.jsx";
// Импорт утилсов
import * as auth from "../utils/auth.js";
import api from "../utils/api.js";


function App() {
  const navigate = useNavigate();
  // Попапы
  const [isEditProfilePopupOpen, setIsEditProfilePopupOpen] = useState(false);
  const [isAddPlacePopupOpen, setIsEditAddPlacePopupOpen] = useState(false);
  const [isDeletePopupOpen, setDeletePopupOpen] = useState(false);
  const [isEditAvatarPopupOpen, setIsEditAvatarPopupOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState({});
  const [isImgPopup, setImgPopup] = useState(false);
  const [isInfoTooltip, setIsInfoTooltip] = useState({
    isOpen: false,
    isSucessfull: false,
  });


  // Инфо о пользователе
  const [currentUser, setCurrentUser] = useState({});
  // Попап карточек
  const [cards, setCards] = useState([]);
  const [deleteCardId, setDeleteCardId] = useState("");
  
  // Авторизация юзера
  const [loggedIn, setLoggedIn] = useState(false);
  const [email, setEmail] = useState("");

  const closePopups = useCallback(() => {
    setIsEditProfilePopupOpen(false);
    setIsEditAddPlacePopupOpen(false);
    setIsEditAvatarPopupOpen(false);
    setImgPopup(false);
    setDeletePopupOpen(false);
    setIsInfoTooltip({
      isOpen: false,
      isSucessfull: false,
    });
  }, []);

   
// Реализация закрытия попапов на Esc и оверлей
  const isSomePopupOpen =
    isEditProfilePopupOpen ||
    isAddPlacePopupOpen ||
    isDeletePopupOpen ||
    isEditAvatarPopupOpen ||
    isInfoTooltip ||
    isImgPopup;

  useEffect(() => {
    const closePopupsByEsc = (evt) => {
      if (evt.key === "Escape") {
        closePopups();
      }
    };
    if (isSomePopupOpen) {
      document.addEventListener("keydown", closePopupsByEsc);
      return () => {
        document.removeEventListener("keydown", closePopupsByEsc);
      };
    }
  }, [isSomePopupOpen]);

 //Проверка токена и перенаправление юзера
 useEffect(() => {
  checkToken();
}, []);

function checkToken() {
  const token = localStorage.getItem("token");
  if (token) {
    auth
      .getUser(token)
      .then((res) => {
        if (res) {
          setEmail(res.data.email);
          handleLoggedIn();
          navigate("/");
        }
      })
      .catch((err) => console.error(`Упс..., произошла ошибка ${err}`));
      };
  }

  function handleRegister(password, email) {
    auth
      .register(password, email)
      .then((res) => {
        if (res) {
          handleInfoTooltip(true);
          navigate("/sign-in");
        }
      })
      .catch((err) => {console.error(err);
        handleInfoTooltip(false);
      });
  }

  function handleInfoTooltip(effect) {
    setIsInfoTooltip({ ...isInfoTooltip, isOpen: true, isSucessfull: effect });
  }

  function handleExit() {
    localStorage.removeItem("token");
    setLoggedIn(false);
    setEmail("");
    navigate("/sign-in");
  }

  function handleLogin(password, email) {
    auth
      .authorization(password, email)
      .then((data) => {
        if (data.token) {
          setEmail(email);
          setLoggedIn(true);
          localStorage.setItem("token", data.token);
          navigate("/");
        }
      })
      .catch((err) => console.error(`Упс..., произошла ошибка ${err}`));
  }


  function handleLoggedIn() {
    setLoggedIn(true);
  }


  function handleEditProfileClick() {
    setIsEditProfilePopupOpen(true);
  }

  function handleAddPlaceClick() {
    setIsEditAddPlacePopupOpen(true);
  }

  function handleEditAvatarClick() {
    setIsEditAvatarPopupOpen(true);
  }

  function handleDeletePopupClick(cardId) {
    setDeleteCardId(cardId);
    setDeletePopupOpen(true);
  }

  function handleCardClick(card) {
    setSelectedCard(card);
    setImgPopup(true);
  }

  function handleUpdateUser(item) {
    const { name, about } = item;
    api
      .setUserInfo(name, about)
      .then((user) => {
        setCurrentUser({
          ...currentUser,
          name: user.name,
          about: user.about,
        });
        setIsEditProfilePopupOpen(false);
      })
      .catch((err) => console.error(`Упс..., произошла ошибка ${err}`));
  }

  function handleUpdateAvatar(item) {
    const { avatar } = item;
    api
      .setChangeAvatar(avatar)
      .then(function (user) {
        setCurrentUser({
          ...currentUser,
          avatar: user.avatar,
        });
        setIsEditAvatarPopupOpen(false);
      })
      .catch((err) => console.error(`Упс..., произошла ошибка ${err}`));
  }

  function handleAddPlace(data) {
    api
      .addNewCard(data)
      .then((newCard) => {
        setCards([newCard, ...cards]);
        closePopups();
      })
      .catch((err) => console.error(`Упс..., произошла ошибка ${err}`));
  }

  function handleCardLike(card) {
    const isLiked = card.likes.some((item) => item._id === currentUser._id);
    if (isLiked) {
      api
        .deleteLikeCard(card._id)
        .then((res) => {
          setCards((state) => state.map((c) => (c._id === card._id ? res : c)));
        })
        .catch((err) => console.error(`Упс..., произошла ошибка ${err}`));
    } else {
      api
        .addLikeCard(card._id)
        .then((res) => {
          setCards((state) => state.map((c) => (c._id === card._id ? res : c)));
        })
        .catch((err) => console.error(`Упс..., произошла ошибка ${err}`));
    }
  }


  useEffect(() => {
    Promise.all([api.getInitialCards(), api.getCards()])
      .then(([dataUser, dataCard]) => {
        setCurrentUser(dataUser);
        setCards(dataCard);
      })
      .catch((err) => console.error(`Упс..., произошла ошибка ${err}`));
  }, []);

  function handleCardDelete() {
    api
      .removeCard(deleteCardId)
      .then(() => {
        setCards((state) => state.filter((c) => c._id !== deleteCardId));
        closePopups();
      })
      .catch((err) => console.error(`Упс..., произошла ошибка ${err}`));
  }

  return (
    <CurrentUserContext.Provider value={currentUser}>
      <div className="page__container">
        
        <Header email={email} exit={handleExit} loggedIn={loggedIn}/>
        <Routes>
          <Route path="/sign-in" element={<Login onLogin={handleLogin} />} />
          <Route
            path="/sign-up"
            element={<Register onRegister={handleRegister} />}
          />
          <Route
            path="*"
            element={<Navigate to={loggedIn ? "/" : "/sign-in"} />}
          />
          <Route
            path="/"
            element={
              <ProtectedRoute
                component={Main}
                loggedIn={loggedIn}
                onEditProfile={handleEditProfileClick}
                onAddPlace={handleAddPlaceClick}
                onEditAvatar={handleEditAvatarClick}
                onCardClick={handleCardClick}
                onCardDelete={ handleDeletePopupClick}
                onCardLike={handleCardLike}
                cards={cards}
              />
            }
            />
            </Routes>
        <Footer />

        <EditProfilePopup
          isOpen={isEditProfilePopupOpen}
          onClose={closePopups}
          onUpdateUser={handleUpdateUser}
        />

        <EditAvatarPopup
          isOpen={isEditAvatarPopupOpen}
          onClose={closePopups}
          onUpdateAvatar={handleUpdateAvatar}
        />
        <AddPlacePopup
          isOpen={isAddPlacePopupOpen}
          onClose={closePopups}
          onAddPlace={handleAddPlace}
        />

        <EditDeletePopup
          isOpen={isDeletePopupOpen}
          onClose={closePopups}
          onSubmit={handleCardDelete}
          card={deleteCardId}
        />

        <ImagePopup
          card={selectedCard}
          isOpen={isImgPopup}
          onClose={closePopups}
        />
           <InfoTooltip effect={isInfoTooltip} onClose={closePopups} />
      </div>
    </CurrentUserContext.Provider>
  );
  }
  export default App;
  
     
      

  


    

 


 













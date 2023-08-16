import Header from "./Header/Header.jsx";
import Main from "./Main/Main.jsx";
import Footer from "./Footer/Footer.jsx";
import ImagePopup from "./ImagePopup/ImagePopup.jsx";
import { useCallback, useEffect, useState } from "react";
import CurrentUserContext from "../contexts/CurrentUserContext.js";
import EditProfilePopup from "./EditProfilePopup/EditProfilePopup.jsx";
import EditAvatarPopup from "./EditAvatarPopup/EditAvatarPopup.jsx";
import EditDeletePopup from "./EditDeletePopup/EditDeletePopup.jsx";
import AddPlacePopup from "./AddPlacePopup/AddPlacePopup.jsx";
import api from "../utils/api.js";

function App() {
  // Попапы
  const [isEditProfilePopupOpen, setIsEditProfilePopupOpen] = useState(false);
  const [isAddPlacePopupOpen, setIsEditAddPlacePopupOpen] = useState(false);
  const [isDeletePopupOpen, setDeletePopupOpen] = useState(false);
  const [isEditAvatarPopupOpen, setIsEditAvatarPopupOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState({});
  const [isImgPopup, setImgPopup] = useState(false);
  //
  const [currentUser, setCurrentUser] = useState({});
  // Попап карточек
  const [cards, setCards] = useState([]);
  const [deleteCardId, setDeleteCardId] = useState("");

  const closePopups = useCallback(() => {
    setIsEditProfilePopupOpen(false);
    setIsEditAddPlacePopupOpen(false);
    setIsEditAvatarPopupOpen(false);
    setImgPopup(false);
    setDeletePopupOpen(false);
  }, []);

  const isSomePopupOpen =
    isEditProfilePopupOpen ||
    isAddPlacePopupOpen ||
    isDeletePopupOpen ||
    isEditAvatarPopupOpen ||
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
        .catch((err) => console.error(err));
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
        <Header />
        <Main
          oneEditProfile={handleEditProfileClick}
          onAddPlace={handleAddPlaceClick}
          onEditAvatar={handleEditAvatarClick}
          onCardClick={handleCardClick}
          onCardDelete={handleDeletePopupClick}
          onCardLike={handleCardLike}
          cards={cards}
        />
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
      </div>
    </CurrentUserContext.Provider>
  );
}
export default App;

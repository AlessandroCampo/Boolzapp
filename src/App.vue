<template>
  <div v-if="loading" class="flex items-center justify-center h-screen">
    <img src="../public/assets/boolzapp-high-resolution-logo-transparent.png" alt="logo" class="w-1/5 spinning">
  </div>
  <div class="login-page" v-else-if="!logged">
    <div class="card">
      <form @submit.prevent="login" v-if="!sign">
        <div class="title text-3xl">Login</div>
        <input placeholder="Email" type="mail" v-model="loginData.email" />
        <br />
        <input placeholder="Password" type="password" v-model="loginData.password" />
        <br />
        <div class="flex items-center justify-center gap-3">
          <input type="checkbox" id="rememberMe" @change="toggleRememberMe" class="w-fit scale-150">
          <label for="rememberMe" class=" text-slate-400 text-xl"> Rimani collegato </label>
        </div>
        <button type="submit" class="text-3xl">Login</button>
        <p class="text-slate-400 text-xl cursor-pointer" @click="logSign"> (Create a new account)</p>
      </form>

      <form @submit.prevent="signUp" v-else>
        <div class="title">Sign Up</div>
        <input class="input" placeholder="Username" type="text" v-model="user.username" />
        <br />
        <input placeholder="Password" type="password" v-model="user.password" />
        <br />
        <input placeholder="email" type="email" v-model="user.email" />
        <br />
        <input type="file" @change="onChangeFileUpload($event)" />
        <button type="submit">Sign Up</button>
        <p class="text-slate-400 text-xl cursor-pointer" @click="logSign">(Have an account already?)</p>
      </form>
    </div>
  </div>
  <div id="app-container" class="w-2/3 h-full flex mx-auto py-12" v-else>
    <div class="app-container-left w-1/2 flex flex-col relative">
      <div class="a-c-l-topbar h-[70px]  bg-slate-200 flex items-center justify-between gap-5 px-2 py-5 ">
        <div class="flex items-center text-2xl gap-2">
          <img :src="userData.avatarSrc ? userData.avatarSrc : `/assets/empty_avatar.png`" alt=""
            class="avatar cursor-pointer" @click="openProfile">
          <span class="active-name" v-if="userData.username"> {{ userData.username }} </span>
        </div>

        <div class="top-icons flex gap-3 text-2xl  text-gray-400">
          <i class="fas fa-address-book cursor-pointer me-4" @click="openContacts"></i>
        </div>
      </div>
      <div class="a-c-l-searchbar  bg-white  text-gray-400 px-4 py-1 flex items-center gap-3 border-b-2">
        <i class="fa-solid fa-magnifying-glass mt-[2px]"></i>
        <input type="text" name="" id="" placeholder="Cerca o inizia una nuova chat" class="w-full px-2 py-1 text-xl "
          v-model="chatFilterString">
      </div>
      <div class="a-c-l-chat-list flex-grow  bg-white scrollable-container">
        <div class="chat-left flex gap-3 py-2 px-4 border-b-2 items-center cursor-pointer" v-for="(user, index) in users"
          :key="index"
          v-show="user.username !== userData.username && userData.activeChats.includes(user.username) && (!chatFilterString || user.username.includes(chatFilterString.toLowerCase()))"
          @click="changeChat(index)">
          <img :src="user.avatarSrc ? user.avatarSrc : `../assets/empty_avatar.png`" alt="" class="avatar">
          <div class="user-info text-xl flex flex-col w-3/4">
            <span class="user-name text-gray-950">
              {{ user.username }}
            </span>
            <span class="last-seen text-xs text-gray-400"
              v-if="user.messages[0] && user.messages[user.messages.length - 1].type === 'text'">
              {{
                user.messages[user.messages.length - 1].text }}
            </span>

            <span class="last-seen text-xs text-gray-400"
              v-else-if="user.messages[0] && user.messages[user.messages.length - 1].type === 'audio'">
              <i class="fas fa-microphone text-green-700"></i>
              {{
                formatTime(user.messages[user.messages.length - 1].duration)
              }}
            </span>

          </div>

          <span class="last-seen text-lg text-gray-400" v-if="user.messages[0]">
            {{ user.messages[user.messages.length - 1].time }}
          </span>

        </div>
      </div>
      <div class="off-canvas contacts">
        <div class="off-canvas-top-bar  h-[70px] bg-[#55e188] flex items-center gap-3">
          <i class="fas fa-arrow-left ms-4 cursor-pointer text-xl" @click="closeContacts"></i>
          <h2 class="text-xl w-1/3 overflow-hidden break-keep whitespace-nowrap opacity-0" ref="newChatTitle">NUOVA CHAT
          </h2>
        </div>
        <div class="a-c-l-searchbar  bg-white  text-gray-400 px-4 py-1 text-xs flex items-center gap-3 border-b-2">
          <i class="fa-solid fa-magnifying-glass mt-[2px]"></i>
          <input type="text" name="" id="" placeholder="Cerca tra i contatti..." class="w-full px-2 py-1 text-xl"
            v-model="contactsFilterString">
        </div>
        <div class="chat-left flex gap-3 py-2 px-4 border-b-2 items-center opacity-0" ref="addUserContainer">
          <img src="../public/assets/add-user.png" alt="" class="avatar cursor-pointer" @click="addUser">
          <div class="user-info text-xs flex flex-col w-3/4">
            <span class="user-name text-gray-950 text-xl overflow-hidden break-keep whitespace-nowrap">
              Aggiungi nuovo utente
            </span>
            <div>
              <input type="text" class="border-2 text-xl w-1/2" v-model="addUserString">
              <i class="fa-solid fa-circle-plus ms-3 text-2xl cursor-pointer w-1/5" @click="addUser"></i>
            </div>

          </div>
          <!-- <span class="last-message-time  text-gray-400 text-[8px]">
            12:00
          </span> -->
        </div>

        <div class="chat-left flex gap-3 py-2 px-4 border-b-2 overflow-y-scroll scrollable-container items-center"
          v-for="(user, index) in users" :key="index"
          v-show="user.username !== userData.username && userData.contacts.includes(user.username) && (!contactsFilterString || user.username.includes(contactsFilterString.toLowerCase()))"
          @click="pushChat(index)">
          <img :src="user.avatarSrc ? user.avatarSrc : `/assets/empty_avatar.png`" alt="" class="avatar">
          <div class="user-info text-2xl flex flex-col w-3/4">
            <span class="user-name text-gray-950">
              {{ user.username }}
            </span>
            <span class="last-seen text-sm text-gray-400">
              {{ user.mood }}
            </span>
          </div>
          <!-- <span class="last-message-time  text-gray-400 text-[8px]">
            12:00
          </span> -->
        </div>

      </div>
      <div class="off-canvas profile">
        <div class="off-canvas-top-bar  h-[70px] bg-[#55e188] flex items-center gap-3">
          <i class="fas fa-arrow-left ms-4 cursor-pointer text-2xl" @click="closeProfile"></i>
          <h2 class="text-2xl w-1/4 opacity-0" ref="profileTitle">Profilo</h2>
        </div>
        <div id="avatarInputContainer" class="">
          <input type=" file" id="avatarInput" style="display: none" @change="onChangeFileUpload($event)">
          <label for="avatarInput">
            <figure class="">
              <img :src="userData.avatarSrc ? userData.avatarSrc : '/assets/empty_avatar.png'" alt=""
                class="rounded-full cursor-pointer mt-4 w-full">
              <div class="text-4xl">
                <i class="fas fa-camera text-3xl mb-3"></i>
                <span class="text-3xl w-2/3"> Cambia la tua immagine profilo</span>
              </div>
            </figure>
          </label>
        </div>
        <div>

          <div class="flex justify-around items-center px-3 mt-16 w-full opacity-0" ref="moodInput">
            <div class="text-green-600 text-2xl"> Mood </div>
            <input type="text" disabled id="mood" v-model="moodChangeString"
              class="text-2xl border-2 px-2 py-1 border-gray-800">
            <i class="fas fa-pencil cursor-pointer text-2xl" @click="editMood"></i>
          </div>
        </div>
      </div>
    </div>
    <div class="app-container-right w-2/3  flex flex-col" v-if="activeChat !== null">
      <div class="a-c-r-topbar h-[70px]  bg-slate-200 flex items-center gap-5 px-2 py-5 border-l-2 border-l-gray-400">
        <img :src="users[activeChat].avatarSrc" alt="" class="avatar">
        <div class="user-info text-xs flex flex-col w-3/4">
          <span class="user-name text-gray-950 text-2xl">
            {{ users[activeChat].username }}
          </span>
          <span class="user-name text-gray-600 text-lg">
            {{ users[activeChat].status }}
          </span>
          <!-- <span class="last-seen text-[8px] text-gray-400">
            Ultimo accesso 20 minuti fa
          </span> -->
        </div>
        <!-- <div class="top-icons flex gap-3 text-xs  text-gray-400">
          <i class="fa-solid fa-magnifying-glass"></i>
          <i class="fa-solid fa-paperclip"></i>
          <i class="fa-solid fa-ellipsis-vertical"></i>
        </div> -->
      </div>
      <div class="a-c-r-message-box flex-grow bg-slate-400 px-12 py-4 overflow-y-scroll relative scrollable-container">
        <div id="emoji-container" class="notVisible">
          <div class="a-c-l-searchbar  bg-white  text-gray-400 px-4 py-1 text-xs flex items-center gap-3 border-b-2">
            <i class="fa-solid fa-magnifying-glass mt-[2px]"></i>
            <input type="text" name="" id="" placeholder="Cerca emoji..." class="w-full px-2 py-1 text-[10px]"
              v-model="emojiSearchString">
          </div>
          <ul id="emoji-list">
            <li class="cursor-pointer" v-for="(emoji) in  emojis " :key="emoji.slug"
              v-show="!emojiSearchString || emoji.slug.toLowerCase().includes(emojiSearchString.toLowerCase())"
              @click="addEmoji(emoji.character)">
              {{ emoji.character }}
            </li>
          </ul>
        </div>
        <div class="message " v-for="(message, index) in userData.messages" :key="index"
          :class="currentUserUid !== message.to ? 'from-user' : 'from-others'"
          v-show="(currentUserUid === message.from && currentChatUid === message.to) || (currentUserUid === message.to && currentChatUid === message.from)">
          <span class="message-content" v-if="message.type === 'text'">
            {{ message.text }}
          </span>
          <div class="audio-player" v-else>
            <audio :src="message.text" controls class="audio-controls hidden" :id="`player${index}`"></audio>
            <div class="audio-message flex items-center gap-3">
              <img :src="currentUserUid !== message.to ? users[activeChat].avatarSrc : userData.avatarSrc" alt=""
                class="avatar">
              <i class="
                fas fa-play text-xl cursor-pointer" @click="playAudio(index, $event)"></i>
              <input type="range" name="" :id="`slider${index}`" value=0 :max="message.duration" :ref="`slider${index}`">
              <span>{{ formatTime(message.duration) }}</span>
            </div>

          </div>

          <span class="message-time"> {{ message.time }} </span>
        </div>

      </div>
      <div class="a-c-r-bottombar h-[70px]  bg-slate-200 flex items-center justify-around py-5">
        <i class="fa-regular fa-face-smile text-gray-700 cursor-pointer text-xl" @click="toggleEmojis"></i>

        <input type="text" placeholder="Scrivi un messaggio...." class="w-3/5 px-2 py-1 h-[60px] text-xl"
          v-model="currentText.text" @keyup.enter="sendMessage">
        <i class="fa-solid fa-microphone  text-gray-700 cursor-pointer text-xl" @click="toggleMic"
          v-if="!currentText.text"></i>
        <i class="fas fa-paper-plane text-gray-700 cursor-pointer text-xl" @click="sendMessage" v-else></i>
      </div>
    </div>
    <div class="app-container-right w-2/3  flex flex-col items-center justify-center bg-slate-200 text-gray-700 " v-else>
      <img src="../public/assets/boolzapp-high-resolution-logo-transparent.png" alt="" class="w-1/2 mb-20">
      <h3 class="text-3xl">
        COMINCIA UNA NUOVA CHAT
      </h3>
    </div>
  </div>
</template>


<script>
import { onSnapshot, collection, doc, deleteDoc, setDoc, addDoc, orderBy, query, getDoc } from "firebase/firestore";
import { updateDoc, arrayUnion, arrayRemove, serverTimestamp } from "firebase/firestore";
import { db, storage } from "./firebase"
import { onUnmounted } from "vue"
import { createUserWithEmailAndPassword } from "firebase/auth";
import { signInWithEmailAndPassword } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import { gsap } from 'gsap'
import { uploadBytes, getDownloadURL, ref } from "firebase/storage"


const userCollection = collection(db, "Users")




export default {
  name: 'App',
  components: {
  },
  data() {
    return {
      users: [],
      loginData: {
        email: "",
        password: ""
      },
      user: {
        username: "",
        password: "",
        avatarSrc: "",
        email: "",

      },
      uid: "",
      sign: false,
      logged: false,
      loading: true,
      is_recording: false,
      can_record: false,
      recorder: null,
      podcastDuration: 0,
      podcastInterval: null,
      chuncks: [],
      collection: userCollection,
      currentUser: null,
      currentUserUid: null,
      currentChatUid: null,
      userData: {},
      activeChat: null,
      currentChats: [],
      userChatHistory: null,
      addUserString: "",
      moodChangeString: "",
      emojiSearchString: "",
      chatFilterString: "",
      contactsFilterString: "",
      currentText: {
        text: "",
        status: ""
      },
      emojis: []
    }
  }
  , mounted() {
    this.setupAudio()
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        // User is signed in
        this.logged = true
        this.loading = false
        this.currentUser = user;
        this.currentUserUid = user.uid
        this.fetchUserData(user.uid);

      } else {
        // User is signed out
        this.currentUser = null;
        this.userData = null;
        this.logged = false
      }

    });



  },
  created() {

    fetch('https://emoji-api.com/emojis?access_key=be75f8e104ed4ec4c32d07788050d5a7c5306cbc')
      .then(res => res.json())
      .then(data => {
        this.emojis.push(...data);
      })
  },
  methods: {
    async onChangeFileUpload(event) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onload = async () => {
        this.user.avatarSrc = reader.result;
        if (this.logged) {
          const userCol = doc(db, "Users", this.currentUserUid);
          this.userData.avatarSrc = reader.result;
          await updateDoc(userCol, {
            "avatarSrc": reader.result
          });
        }
      };
      reader.readAsDataURL(file);
    },

    async signUp() {
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, this.user.email, this.user.password);
        const user = userCredential.user;
        this.sign = false;

        await setDoc(doc(db, "Users", user.uid), {
          username: this.user.username,
          avatarSrc: this.user.avatarSrc,
          password: this.user.password,
          email: this.user.email,
          messages: [],
          contacts: [],
          activeChats: [],
          mood: "Hey there, I'm using Boolzap!",
          uid: user.uid,
          status: "Offline"
        });

        console.log("User successfully signed up!");
      } catch (error) {
        if (error.code === 'auth/email-already-in-use') {
          window.alert('Email is already in use.')
        } else {
          console.error('Error signing up user:', error.message);
          window.alert('Error signing up user:', error.message);
        }
      }
    },

    async login(email, password) {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, this.loginData.email, this.loginData.password);
        const user = userCredential.user;
        this.logged = true
        this.uid = user.uid
        this.retrieveData()
        console.log(this.users)
      } catch (error) {
        console.error("Error signing in:", error.message);
        window.alert("I dati inseriti non sono corretti")
      }
    },

    logSign() {
      this.sign = !this.sign
    },
    openContacts() {
      let offc = document.querySelector(".off-canvas.contacts")
      const chatTitle = this.$refs.newChatTitle
      const addUsCont = this.$refs.addUserContainer
      offc.style.display = "block"
      gsap.to(chatTitle, {
        opacity: 1,
        duration: 0.4
      })
      gsap.to(addUsCont, {
        opacity: 1,
        duration: 0.4
      })
      gsap.to(offc, {
        width: "100%",
        duration: 0.5
      })
    },
    closeContacts() {
      let offc = document.querySelector(".off-canvas.contacts")
      const chatTitle = this.$refs.newChatTitle
      const addUsCont = this.$refs.addUserContainer
      setTimeout(() => {
        gsap.to(chatTitle, {
          opacity: 0,
          duration: 0.2
        })
        gsap.to(addUsCont, {
          opacity: 0,
          duration: 0.2
        })
      }, 100)
      gsap.to(offc, {
        width: "0%",
        duration: 0.5,
        onComplete() {
          offc.style.display = "none"
        }
      })
    },
    openProfile() {
      let offc = document.querySelector(".off-canvas.profile")
      const moodInput = this.$refs.moodInput
      const profileTitle = this.$refs.profileTitle
      setTimeout(() => {
        gsap.to(profileTitle, {
          opacity: 1,
          duration: 0.2
        })
      }, 100)

      gsap.to(moodInput, {
        opacity: 1,
        duration: 0.4
      })
      this.moodChangeString = this.userData.mood
      console.log(this.moodChangeString)
      offc.style.display = "block"
      gsap.to(offc, {
        width: "100%",
        duration: 0.5
      })
    },
    closeProfile() {
      let offc = document.querySelector(".off-canvas.profile")
      const moodInput = this.$refs.moodInput
      const profileTitle = this.$refs.profileTitle
      setTimeout(() => {
        gsap.to(profileTitle, {
          opacity: 0,
          duration: 0.2
        })
      }, 100)
      gsap.to(moodInput, {
        opacity: 0,
        duration: 0.5
      })
      gsap.to(offc, {
        width: "0%",
        duration: 0.5,
        onComplete() {
          offc.style.display = "none"
        }
      })
    },
    toggleEmojis() {
      let emojiMenu = document.getElementById("emoji-container")

      // this.loadEmojis()
      emojiMenu.classList.toggle("notVisible")

    },
    addEmoji(emoji) {
      this.currentText.text += emoji
    },
    async editMood(e) {
      const userCol = doc(db, "Users", this.currentUserUid)
      let inputMood = document.getElementById("mood")
      if (e.target.classList.contains("fa-pencil")) {
        e.target.classList.remove("fa-pencil")
        e.target.classList.add("fa-check")
      } else {
        e.target.classList.add("fa-pencil")
        e.target.classList.remove("fa-check")

        await updateDoc(userCol, {
          "mood": this.moodChangeString
        })
      }

      inputMood.disabled = !inputMood.disabled
    },
    async addUser() {
      const userCol = doc(db, "Users", this.currentUserUid)
      let contactMatched = false
      this.userData.contacts.forEach((contact) => {
        if (this.addUserString === contact) {
          window.alert(`${contact} is already in your contacts`)
        }
      })
      for (const user of this.users) {
        if (this.addUserString.toLowerCase() === user.username.toLowerCase()) {
          await updateDoc(userCol, {
            "contacts": arrayUnion(
              user.username
            )
          });
          contactMatched = true;
          break;
        }
      }
      if (!contactMatched) {
        window.alert(`User ${this.addUserString} does not exist`);
      }
      this.addUserString = ""
    },
    changeChat(index) {

      this.activeChat = index
      this.currentChatUid = this.users[this.activeChat].id
    },
    async pushChat(index) {

      const userCol = doc(db, "Users", this.currentUserUid)
      this.activeChat = index
      this.currentChatUid = this.users[this.activeChat].id
      this.currentChats.push(this.users[index].username)
      await updateDoc(userCol, {
        "activeChats": arrayUnion(
          this.users[index].username
        ),
      })
    },
    async sendMessage() {

      if (!this.currentChatUid) {
        this.currentChatUid = this.users[this.activeChat].id
      }
      const userCol = doc(db, "Users", this.currentUserUid)
      const recipientCol = doc(db, "Users", this.currentChatUid)
      const timeStamp = this.getCurrentDateTimeString()
      await updateDoc(userCol, {
        "messages": arrayUnion({
          type: "text",
          time: timeStamp,
          text: this.currentText.text,
          to: this.currentChatUid,
          from: this.currentUserUid
        }),
      })
      await updateDoc(recipientCol, {
        "messages": arrayUnion({
          type: "text",
          time: timeStamp,
          text: this.currentText.text,
          to: this.currentChatUid,
          from: this.currentUserUid
        }),
      })
      await updateDoc(recipientCol, {
        "activeChats": arrayUnion(
          this.userData.username
        ),
      })
      this.currentText.text = '';
    }
    ,
    retrieveData() {
      const unsubscribe = onSnapshot(userCollection, (snapshot) => {
        snapshot.docChanges().forEach(change => {
          const docData = change.doc.data();
          if (change.type === 'added') {
            // Check if the document with this ID already exists in the array
            const existingUserIndex = this.users.findIndex(user => user.id === change.doc.id);
            if (existingUserIndex === -1) {
              // If not found, push the new user data to the array
              this.users.push({
                id: change.doc.id,
                ...docData
              });
            } else {
              // If found, update the existing user data
              this.users[existingUserIndex] = {
                id: change.doc.id,
                ...docData
              };
            }
          } else if (change.type === 'modified') {
            // Find the user in the array and update their data
            const existingUserIndex = this.users.findIndex(user => user.id === change.doc.id);
            if (existingUserIndex !== -1) {
              this.users[existingUserIndex] = {
                id: change.doc.id,
                ...docData
              };
            }
          } else if (change.type === 'removed') {
            // Remove the user from the array if it's deleted
            this.users = this.users.filter(user => user.id !== change.doc.id);
          }
        });
      });
    }
    ,
    async fetchUserData(uid) {
      try {
        // Fetch user data from Firestore based on UID
        const docRef = doc(db, "Users", uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const unsub = onSnapshot(doc(db, "Users", uid), (doc) => {
            this.userData = doc.data()
          });
        } else {
          console.log("No such document!");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    },
    setupAudio() {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ audio: true }).then(this.setupStream).catch(err => {
          console.error(err)
        })
      }
    },
    setupStream(stream) {

      this.recorder = new MediaRecorder(stream)
      this.recorder.ondataavailable = e => {
        this.chuncks.push(e.data)

      }

      this.recorder.onstop = async (e) => {
        let storedDuration = this.podcastDuration
        clearInterval(this.podcastInterval)
        this.podcastInterval = null
        this.podcastDuration = 0
        const userCol = doc(db, "Users", this.currentUserUid);
        const recipientCol = doc(db, "Users", this.currentChatUid);
        const timeStamp = this.getCurrentDateTimeString()
        const userStorageRef = ref(storage, `${this.currentUserUid}/audio${this.generateUniqueID()}`)
        const recStorageRef = ref(storage, `${this.currentChatUid}/audio${this.generateUniqueID()}`)
        const blob = new Blob(this.chuncks, { type: "audio/ogg; codecs=opus" })
        this.chuncks = []
        await uploadBytes(userStorageRef, blob).then((snapshot) => {
          console.log("uploaded!")
        })
        await uploadBytes(recStorageRef, blob).then((snapshot) => {
          console.log("uploaded!")
        })
        getDownloadURL(userStorageRef).then(async (url) => {
          await updateDoc(userCol, {
            "messages": arrayUnion({
              type: "audio",
              text: url,
              duration: storedDuration,
              to: this.currentChatUid,
              from: this.currentUserUid,
              time: timeStamp
            }),
          })
          await updateDoc(recipientCol, {
            "messages": arrayUnion({
              type: "audio",
              text: url,
              duration: storedDuration,
              to: this.currentChatUid,
              from: this.currentUserUid,
              time: timeStamp
            }),
          })
          await updateDoc(recipientCol, {
            "activeChats": arrayUnion(
              this.userData.username
            ),
          })
        })


      }

      this.can_record = true
    },
    toggleMic(e) {

      if (!this.can_record) return
      this.is_recording = !this.is_recording
      if (this.is_recording) {
        this.recorder.start()
        this.podcastInterval = setInterval(() => { this.podcastDuration++ }, 1000)
        e.target.classList.remove("text-gray-700")
        e.target.classList.add("text-red-700")
      } else {
        this.recorder.stop()

        e.target.classList.remove("text-red-700")
        e.target.classList.add("text-gray-700")
      }
    },
    playAudio(index, event) {
      const audioElement = document.querySelector(`#player${index}`);
      const sliderElement = document.querySelector(`#slider${index}`);


      function updateSlider() {
        sliderElement.value = audioElement.currentTime;
      }

      // Add event listeners for 'timeupdate' and 'input' events
      audioElement.addEventListener("timeupdate", updateSlider);
      sliderElement.addEventListener("input", () => {
        audioElement.currentTime = sliderElement.value;
      });


      if (event.target.classList.contains("fa-play")) {
        event.target.classList.remove("fa-play")
        event.target.classList.add("fa-pause")
        audioElement.play();
        audioElement.addEventListener("ended", function () {
          event.target.classList.remove("fa-pause")
          event.target.classList.add("fa-play")
          audioElement.currentTime = 0;
        })
      } else {
        event.target.classList.remove("fa-pause")
        event.target.classList.add("fa-play")
        audioElement.pause()
      }
    },
    // pauseAudio(index, event) {


    //   const audioElement = document.querySelector(`#player${index}`);

    // },
    generateUniqueID() {
      const timestamp = Date.now();
      const randomNumber = Math.floor(Math.random() * 10000); // Adjust the range as needed
      const uniqueID = `${timestamp}_${randomNumber}`;
      return uniqueID;
    },
    formatTime(seconds) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = Math.floor(seconds % 60);

      const formattedMinutes = String(minutes).padStart(2, '0');
      const formattedSeconds = String(remainingSeconds).padStart(2, '0');

      return `${formattedMinutes}:${formattedSeconds}`;
    },
    getCurrentDateTimeString() {
      const now = new Date();

      const month = String(now.getMonth() + 1).padStart(2, '0'); // Adding 1 to month as it starts from 0
      const day = String(now.getDate()).padStart(2, '0');
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');

      return `${month}/${day} ${hours}:${minutes}`;
    },
    async updateLogout() {

    },
    async confirmExit() {

      return "You have attempted to leave this page. Are you sure?";
    }
  }

}



</script>

<style>
@import '../src/style.css';
</style>
